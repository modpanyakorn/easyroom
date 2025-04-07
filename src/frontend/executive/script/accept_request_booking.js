// ฟังก์ชันช่วยสำหรับรวมข้อความในแต่ละแถว (ใช้สำหรับค้นหา)
function getRowText(row) {
  return (
    new Date(row.submitted_time).toLocaleDateString("th") +
    " " +
    row.full_name +
    " " +
    row.role +
    " " +
    row.room_id +
    " " +
    row.participantCount +
    " " +
    row.used_date +
    " " +
    row.start_time +
    " " +
    row.end_time +
    " " +
    row.request_type
  ).toLowerCase();
}
// ฟังก์ชันแปลงวันที่ให้เป็นชื่อย่อของวัน
function getDayOfWeek(dateStr) {
  const days = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
  return days[new Date(dateStr).getDay()];
}

async function fetchData() {
  try {
    // ดึงข้อมูลจาก API ทั้ง 4 แห่ง
    const [roomsRes, stuRes, teaRes, partRes] = await Promise.all([
      fetch(`${API_URL}/executive/room_request`),
      fetch(`${API_URL}/executive/student`),
      fetch(`${API_URL}/executive/teacher`),
      fetch(`${API_URL}/executive/room_request_participant`),
    ]);
    const roomsData = await roomsRes.json();
    const stuData = await stuRes.json();
    const teaData = await teaRes.json();
    const partData = await partRes.json();

    // กรองข้อมูลให้เหลือเฉพาะคำขอที่มีสถานะ "อนุมัติ" และประเภท "นอกเวลา"
    // (หมายเหตุ: ในโค้ดเดิมมีการตรวจสอบ used_date แล้วเรียก updateStatus
    //  แต่ถ้าให้แสดงข้อมูลตามที่อยู่ในฐานข้อมูล ให้ลบหรือคอมเมนต์ส่วนนี้ออก)
    const filteredData = roomsData.filter(
      (row) =>
        row.request_status === "อนุมัติ" && row.request_type === "นอกเวลา"
    );

    // รวมข้อมูลจากตาราง student, teacher และนับจำนวนผู้เข้าร่วม
    let data = filteredData.map((r) => {
      const stu = stuData.find((s) => s.student_id === r.student_id) || {};
      const tea = teaData.find((t) => t.teacher_id === r.teacher_id) || {};
      return {
        ...r,
        full_name: stu.full_name || tea.full_name,
        role: stu.role || tea.role,
        participantCount: partData.filter(
          (p) => p.room_request_id === r.room_request_id
        ).length,
      };
    });

    // กรองข้อมูลด้วยคำค้นหา (Search) แบบเรียลไทม์
    const search = document.getElementById("searchBox").value.toLowerCase();
    if (search) {
      data = data.filter((r) => getRowText(r).includes(search));
    }

    // เรียงข้อมูลตามที่เลือกใน dropdown
    const sortVal = document.getElementById("sorttime").value;
    if (sortVal === "submission_desc" || sortVal === "submission_asc") {
      data.sort((a, b) => {
        const aT = new Date(a.submitted_time);
        const bT = new Date(b.submitted_time);
        return sortVal === "submission_desc" ? bT - aT : aT - bT;
      });
    } else if (sortVal === "overlap_asc" || sortVal === "overlap_desc") {
      // จัดกลุ่มข้อมูลตาม room_id และ used_date
      const groups = {};
      data.forEach((r) => {
        const key = r.room_id + "_" + r.used_date;
        if (!groups[key]) groups[key] = [];
        groups[key].push(r);
      });
      const groupKeys = Object.keys(groups).sort((a, b) => {
        const [roomA, dateA] = a.split("_");
        const [roomB, dateB] = b.split("_");
        if (roomA !== roomB) {
          if (!isNaN(roomA) && !isNaN(roomB))
            return sortVal === "overlap_asc" ? roomA - roomB : roomB - roomA;
          else
            return sortVal === "overlap_asc"
              ? roomA.localeCompare(roomB)
              : roomB.localeCompare(roomA);
        } else {
          return sortVal === "overlap_asc"
            ? new Date(dateA) - new Date(dateB)
            : new Date(dateB) - new Date(dateA);
        }
      });
      let sorted = [];
      groupKeys.forEach((key) => {
        const group = groups[key].sort((a, b) => {
          const aT = a.start_time
            .split(":")
            .reduce((acc, cur) => acc * 60 + Number(cur), 0);
          const bT = b.start_time
            .split(":")
            .reduce((acc, cur) => acc * 60 + Number(cur), 0);
          return sortVal === "overlap_asc" ? aT - bT : bT - aT;
        });
        sorted.push({
          header: true,
          room_id: group[0].room_id,
          used_date: group[0].used_date,
        });
        sorted = sorted.concat(group);
      });
      data = sorted;
    }

    // แสดงผลลงในตาราง
    const tbody = document.getElementById("reservation-table");
    tbody.innerHTML = "";
    if (data.length === 0) {
      tbody.innerHTML = "<tr><td colspan='7'>No data found</td></tr>";
    }
    data.forEach((r) => {
      if (r.header) {
        const headerTr = document.createElement("tr");
        headerTr.innerHTML = `<td colspan="7" style="background: #f0f0f0; text-align: left; padding: 10px; font-weight: bold;">ห้อง: ${
          r.room_id
        }, วันที่: ${new Date(r.used_date).toLocaleDateString("th-TH")}</td>`;
        tbody.appendChild(headerTr);
      } else {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="text-center">${r.room_request_id}</td>
            <td class="text-center">${new Date(
              r.submitted_time
            ).toLocaleDateString("th")}</td>
            <td class="text-center">${r.full_name}</td>
            <td class="text-center">${r.role}</td>
            <td class="text-center">${r.room_id}</td>
            <td class="text-center">${r.participantCount}</td>
            <td class="text-center">
              ${
                getDayOfWeek(r.used_date) +
                " " +
                new Date(r.used_date).toLocaleDateString("th")
              }<br>
              ${r.start_time.slice(0, 5) + " - " + r.end_time.slice(0, 5)}<br>
              ${"(" + r.request_type + ")"}
            </td>
            <td class="text-center">
              <button class="btn btn-danger btn-sm" onclick="cancelStatus(${
                r.room_request_id
              }, 'ไม่อนุมัติ')">ยกเลิก</button>
            </td>
          `;
        tbody.appendChild(tr);
      }
    });
  } catch (e) {
    console.error("❌ Error fetching data:", e);
  }
}

// ตั้ง event listener สำหรับ search และ sort
document.getElementById("sorttime").addEventListener("change", fetchData);
document.getElementById("searchBox").addEventListener("input", fetchData);
document.addEventListener("DOMContentLoaded", fetchData);

// ฟังก์ชันสำหรับยกเลิก (cancelStatus) และอัปเดตสถานะ (updateStatus)
// (ส่วนนี้คุณสามารถคงไว้ตามเดิมหรือแก้ไขเพิ่มเติมตามความต้องการ)
async function updateStatus(requestId, newStatus) {
  try {
    const response = await fetch(`${API_URL}/auth/session`, {
      credentials: "include",
    });

    // ดึง executive_id จาก userSession
    const userSession = await response.json(); // แทนที่ด้วย userSession ที่ได้รับจาก session
    if (!userSession.data) {
      alert("กรุณาเข้าสู่ระบบใหม่");
      window.location.href = "../../index.html";
      return;
    }
    const executive_id = userSession.data.user_id; // ดึง executive_id จาก session

    const res = await fetch(`${API_URL}/executive/updateStatus`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requestId,
        status: newStatus,
        executiveId: executive_id,
      }),
    });
    if (res.ok) {
      fetchData();
    } else {
      console.error("❌ Error updating status:", await res.json());
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถอัปเดตสถานะได้", "error");
    }
  } catch (err) {
    console.error("❌ Error updating status:", err);
    Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้", "error");
  }
}

async function cancelStatus(requestID, updateNewStatus) {
  try {
    const res = await fetch(`${API_URL}/executive/RejectReasons`);
    const reasons = await res.json();
    const opts = reasons
      .map((r) => `<option value="${r}">${r}</option>`)
      .join("");

    const { value: formValues } = await Swal.fire({
      title: "กรุณาระบุเหตุผลที่ไม่อนุมัติ",
      html: `<div style="display: flex; flex-direction: column; text-align: left;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <label style="min-width:150px; font-size:16px;">เลือกเหตุผล:</label>
                  <select id="rejectReason" class="swal2-select">
                    <option value=""> เลือกเหตุผล </option>
                    ${opts}
                  </select>
                </div>
                <div style="display: flex; align-items: center;">
                  <label style="min-width:150px; font-size:16px;">เหตุผลเพิ่มเติม:</label>
                  <input id="additionalReason" type="text" class="swal2-input" placeholder="ระบุเหตุผลเพิ่มเติม">
                </div>
              </div>`,
      showCancelButton: true,
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
      preConfirm: () => {
        // ตรวจสอบค่า ถ้า empty string ให้เป็น null
        const additionalReason = document
          .getElementById("additionalReason")
          .value.trim();
        return {
          reject_reason: document.getElementById("rejectReason").value,
          detail_reject_reason:
            additionalReason.length > 0 ? additionalReason : null, // ส่ง null ถ้าไม่มีการกรอก
        };
      },
    });

    if (formValues) {
      const { reject_reason, detail_reject_reason } = formValues;
      await submitRejection(
        requestID,
        reject_reason,
        detail_reject_reason,
        "ไม่อนุมัติ"
      );
    }
  } catch (error) {
    console.error("❌ Error in cancelStatus:", error);
    Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถโหลดข้อมูลได้", "error");
  }
}

async function submitRejection(
  requestID,
  reject_reason,
  detail_reject_reason,
  updateNewStatus
) {
  Swal.fire({
    title: "ยืนยันที่จะไม่อนุมัติการจองห้อง?",
    text: "โปรดยืนยันว่าคุณต้องการไม่อนุมัติคำขอนี้",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "ยืนยัน",
    cancelButtonText: "ยกเลิก",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const res = await fetch(`${API_URL}/executive/submitRejection`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            room_request_id: requestID,
            reject_reason,
            detail_reject_reason,
          }),
        });
        if (!res.ok) throw new Error("การบันทึกล้มเหลว");
        await updateStatus(requestID, updateNewStatus);
        Swal.fire("สถานะถูกอัปเดต!", "คำขอไม่ได้รับการอนุมัติ", "success");
      } catch (err) {
        console.error("❌ Error in submitRejection:", err);
        Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถอัปเดตสถานะได้", "error");
      }
    }
  });
}
