const currentDate = new Date();

function toggleCalendar() {
  const calendar = document.getElementById("dropdown-calendar");
  if (calendar.style.display === "none" || calendar.style.display === "") {
    calendar.style.display = "block";
    initializeCalendar();
  } else {
    calendar.style.display = "none";
  }
}
document.addEventListener("click", function (event) {
  const calendar = document.getElementById("dropdown-calendar");
  const icon = document.querySelector("i.bi-caret-down-fill");
  if (!calendar.contains(event.target) && event.target !== icon) {
    calendar.style.display = "none";
  }
});

function initializeCalendar() {
  const monthSelect = document.getElementById("month-select");
  const yearSelect = document.getElementById("year-select");
  monthSelect.innerHTML = "";
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  monthNames.forEach((m, i) => {
    const option = document.createElement("option");
    option.value = i;
    option.text = m;
    if (i === currentDate.getMonth()) option.selected = true;
    monthSelect.appendChild(option);
  });
  yearSelect.innerHTML = "";
  const startYear = currentDate.getFullYear() - 10;
  const endYear = currentDate.getFullYear() + 50;
  for (let y = startYear; y <= endYear; y++) {
    const option = document.createElement("option");
    option.value = y;
    option.text = y;
    if (y === currentDate.getFullYear()) option.selected = true;
    yearSelect.appendChild(option);
  }
  renderCustomCalendar();
}

function renderCustomCalendar() {
  const calendarDiv = document.getElementById("custom-calendar");
  calendarDiv.innerHTML = "";
  const month = parseInt(document.getElementById("month-select").value);
  const year = parseInt(document.getElementById("year-select").value);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const table = document.createElement("table");
  table.style.borderCollapse = "collapse";
  table.style.width = "100%";
  const headerRow = document.createElement("tr");
  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach((day) => {
    const th = document.createElement("th");
    th.style.textAlign = "center";
    th.innerText = day;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);
  let date = 1;
  for (let i = 0; i < 6; i++) {
    const row = document.createElement("tr");
    for (let j = 0; j < 7; j++) {
      const cell = document.createElement("td");
      cell.style.textAlign = "center";
      cell.style.padding = "5px";
      cell.style.border = "1px solid #ddd";
      if (i === 0 && j < firstDay) {
        cell.innerText = "";
      } else if (date > daysInMonth) {
        break;
      } else {
        cell.innerText = date;
        cell.style.cursor = "pointer";
        cell.onclick = function () {
          document.getElementById("dropdown-calendar").style.display = "none";
        };
        date++;
      }
      row.appendChild(cell);
    }
    table.appendChild(row);
  }
  calendarDiv.appendChild(table);
}

// Helper functionสำหรับรวมข้อความในแต่ละแถวเพื่อค้นหา
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
// คืนค่าชื่อวันจากวันที่ใช้ห้อง
function getDayOfWeek(dateStr) {
  const days = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
  return days[new Date(dateStr).getDay()];
}
console.log(`${API_URL}/executive/room_request`);
// ฟังก์ชันดึงข้อมูล (fetchData)
async function fetchData() {
  try {
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
    // Filter เฉพาะคำขอที่:
    // - request_status === "รออนุมัติ"
    // - request_type === "นอกเวลา"
    // - วันและเวลาใช้ห้อง (used_date + start_time ในโซน Asia/Bangkok) ยังไม่มาถึง
    const filteredData = roomsData.filter((row) => {
      const usedDate = new Date(row.used_date);
      // แปลงให้เป็นเวลาตามโซนไทย
      const thaiUsedDateTime = new Date(
        usedDate.toLocaleString("en-US", {
          timeZone: "Asia/Bangkok",
        })
      );
      const [hours, minutes, seconds] = row.start_time.split(":").map(Number);
      thaiUsedDateTime.setHours(hours, minutes, seconds, 0);
      // เงื่อนไข: request_status "รออนุมัติ", request_type "นอกเวลา" และ usedDateTime ยังไม่ถึง (>= เวลาปัจจุบัน)
      return (
        row.request_status === "รออนุมัติ" &&
        row.request_type === "นอกเวลา" &&
        thaiUsedDateTime >= new Date()
      );
    });
    // รวมข้อมูลเพิ่มเติมจากตาราง student, teacher, participant
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
    // Apply Search Filter (Real-time)
    const search = document.getElementById("searchBox").value.toLowerCase();
    if (search) {
      data = data.filter((r) => getRowText(r).includes(search));
    }
    // Apply Sorting จาก dropdown
    const sortVal = document.getElementById("sorttime").value;
    if (sortVal === "submission_desc" || sortVal === "submission_asc") {
      data.sort((a, b) => {
        const aTime = new Date(a.submitted_time);
        const bTime = new Date(b.submitted_time);
        return sortVal === "submission_desc" ? bTime - aTime : aTime - bTime;
      });
    } else if (sortVal === "overlap_asc" || sortVal === "overlap_desc") {
      // Group data by room_id and used_date
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
        // Insert group header
        sorted.push({
          header: true,
          room_id: group[0].room_id,
          used_date: group[0].used_date,
        });
        sorted = sorted.concat(group);
      });
      data = sorted;
    }
    // Render Table
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
              <div>
                <button class="btn btn-success btn-sm" onclick="confirmstatus(${
                  r.room_request_id
                }, 'อนุมัติ')">อนุมัติ</button>
                <button class="btn btn-danger btn-sm" onclick="cancelStatus(${
                  r.room_request_id
                }, 'ไม่อนุมัติ')">ไม่อนุมัติ</button>
              </div>
              <div class="mt-2">
                <button class="btn btn-primary btn-sm" onclick="showDetails(${
                  r.room_request_id
                })">รายละเอียด</button>
              </div>
            </td>
          `;
        tbody.appendChild(tr);
      }
    });
  } catch (e) {
    console.error("❌ Error fetching data:", e);
  }
}
document.getElementById("sorttime").addEventListener("change", fetchData);
document.getElementById("searchBox").addEventListener("input", fetchData);
document.addEventListener("DOMContentLoaded", fetchData);

async function confirmstatus(requestId, newStatus) {
  Swal.fire({
    title: "ยืนยันการอนุมัติการจองห้อง?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "ยืนยัน",
    cancelButtonText: "ยกเลิก",
    position: "center",
    customClass: {
      popup: "my-swal-popup",
    },
    heightAuto: false,
    backdrop: true,
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await updateStatus(requestId, newStatus);
        Swal.fire("สถานะถูกอัปเดต!", "คำขอได้รับการอนุมัติแล้ว.", "success");
      } catch (error) {
        Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถอัปเดตสถานะได้", "error");
        console.error(error);
      }
    }
  });
}
async function showDetails(requestID) {
  try {
    const res = await fetch(`${API_URL}/executive/detailsPop`);
    const data = await res.json();
    const booking = data.find((item) => item.requestID === requestID);
    const bookingRoomDetails = booking.detailbookingreason?.trim()
      ? booking.detailbookingreason
      : "ไม่มีข้อมูล";

    if (!booking) {
      Swal.fire("ไม่พบข้อมูลการจอง", "", "error");
      return;
    }
    let htmlContent = `
        <p><strong>ขอใช้ห้อง:</strong> ${booking.roombooking}</p>
        <p><strong>เวลาที่ใช้ห้อง:</strong> ${booking.timebooking}</p>
        <hr/>
        <h6><strong>ข้อมูลผู้จอง</strong></h6>
        <p><strong>รหัสนิสิต / อาจารย์:</strong> ${booking.id}</p>
        <p><strong>ชื่อ-นามสกุล:</strong> ${booking.name}</p>
        <p><strong>Email:</strong> ${booking.email}</p>
        <p><strong>เบอร์ติดต่อ:</strong> ${booking.phone_number}</p>
        <p><strong>สาขาวิชา:</strong> ${booking.department}</p>
        <hr/>
        <h6><strong>ข้อมูลผู้จองร่วม</strong></h6>
      `;
    const parts = data.filter(
      (item) => item.requestID === requestID && item.role !== "ผู้ขอใช้"
    );
    if (parts.length > 0) {
      htmlContent += `
            <div class="table-responsive">
              <table class="table table-bordered" style="font-size: 14px;">
                <thead>
                  <tr>
                    <th>ลำดับ</th>
                    <th>รหัสนิสิต</th>
                    <th>ชื่อ-นามสกุล</th>
                    <th>Email</th>
                    <th>สาขาวิชา</th>
                  </tr>
                </thead>
                <tbody>
          `;
      parts.forEach((p, i) => {
        htmlContent += `
                <tr>
                  <td>${i + 1}</td>
                  <td>${p.id}</td>
                  <td>${p.name}</td>
                  <td>${p.email}</td>
                  <td>${p.department}</td>
                </tr>
              `;
      });
      htmlContent += `
                </tbody>
              </table>
            </div>
          `;
    } else {
      htmlContent += "<p>ไม่มีผู้จองร่วม</p><hr/>";
    }
    htmlContent += `
        <p><strong>มีความประสงค์:</strong> ${booking.bookingreason}</p>
        <p><strong>รายละเอียดเหตุผลการจอง:</strong> ${bookingRoomDetails}</p>
      `;
    Swal.fire({
      title: "รายละเอียดการจองห้อง",
      html: htmlContent,
      width: 700,
      confirmButtonText: "ปิด",
      position: "center",
      customClass: {
        popup: "my-swal-popup",
      },
      heightAuto: false,
      backdrop: true,
      showClass: {
        popup: "",
      },
      hideClass: {
        popup: "",
      },
    });
  } catch (err) {
    console.error("❌ Error in showDetails:", err);
    Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถโหลดข้อมูลได้", "error");
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
  // ถ้า detail_reject_reason ไม่มีค่า (string ว่าง) จะถูกตั้งเป็น null แล้ว
  // ส่งค่าไปใน API request
  detail_reject_reason = detail_reject_reason || null;

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
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            room_request_id: requestID,
            reject_reason,
            detail_reject_reason, // ส่งค่าเป็น null หากไม่มีการกรอกข้อมูล
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
document.addEventListener("DOMContentLoaded", fetchData);
