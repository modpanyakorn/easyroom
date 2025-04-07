async function fetchTeacherInfo() {
  try {
    const response = await fetch(`${API_URL}/auth/session`, {
      credentials: "include",
    });
    const sessionData = await response.json();
    if (!sessionData.data) {
      alert("กรุณาเข้าสู่ระบบใหม่");
      window.location.href = "../../index.html";
      return;
    }
    console.log("✅ ข้อมูลผู้สอนจาก session:", sessionData.data);

    // ใส่ค่าในฟอร์ม
    document.getElementById("teacher-name").value =
      sessionData.data.full_name || "ไม่พบข้อมูล";
    document.getElementById("phone-number").value =
      sessionData.data.phone_number || "ไม่พบข้อมูล";

    // ฯลฯ
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการดึงข้อมูลผู้สอน:", error);
  }
}
async function loadEquipmentMapping() {
  let equipmentMapping = {};
  try {
    const response = await fetch(`${API_URL}/booker/getEquipmentInformation`);
    if (!response.ok) throw new Error("HTTP error " + response.status);

    const equipData = await response.json();
    console.log("✅ ข้อมูลอุปกรณ์จาก API:", equipData);

    // แมปค่า equipment_id -> equipment_name
    equipData.forEach((item) => {
      equipmentMapping[item.equipment_id] = item.equipment_name;
    });
  } catch (err) {
    console.error("❌ Error fetching equipment information:", err);
  }
  return equipmentMapping;
}

//เพิ่มข้อมูลในฐานข้อมูล
async function submitBookingA() {
  const urlParams = new URLSearchParams(window.location.search);
  const room_id = urlParams.get("room");
  const used_date = urlParams.get("date");
  const start_time = urlParams.get("startTime");
  const end_time = urlParams.get("endTime");

  const request_type = "ในเวลา";
  const request_reason = document.querySelector("select[name='usage']").value;
  const detail_request_reason =
    document.getElementById("additional-details").value || null;
  const desks = urlParams.get("desks")
    ? urlParams.get("desks").split(",").map(Number)
    : [];
  const equipments = urlParams.get("equipments") || "";

  const teacher_name = document.getElementById("teacher-name").value || null;
  const phone_number = document.getElementById("phone-number").value || null;

  if (!room_id || !used_date || !start_time || !end_time || !request_reason) {
    Swal.fire("กรอกข้อมูลไม่ครบ", "กรุณากรอกข้อมูลให้ครบถ้วน", "warning");
    return;
  }

  // เตรียมค่าที่จะแสดงใน SweetAlert
  const roomName = document.getElementById("room-info").textContent;
  const roomType = document.getElementById("room-type-info").textContent;
  const timeRange = document.getElementById("time-range-info").textContent;
  const formattedDate = new Date(used_date).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  const confirmResult = await Swal.fire({
    title: "<strong>ยืนยันการจอง</strong>",
    icon: "warning",
    html: `
          <div style="font-size: 16px; text-align: center;">
          <b>วันที่จอง:</b> ${formattedDate}<br>
          <b>เวลาที่จอง:</b> ${timeRange}<br>
          <b>ห้องที่จอง:</b> ${roomName} (${roomType})<br><br>
          <span style="color:red;">หากยืนยันแล้วจะไม่สามารถเปลี่ยนแปลงได้</span>
          </div>
    `,
    showCancelButton: true,
    confirmButtonText: "ยืนยัน",
    cancelButtonText: "ยกเลิก",
    confirmButtonColor: "#7c4dff",
    cancelButtonColor: "#616161",
    reverseButtons: false,
  });

  if (!confirmResult.isConfirmed) return;

  const dataToSend = {
    room_id,
    used_date,
    start_time,
    end_time,
    request_type,
    request_reason,
    detail_request_reason,
    desks,
    equipments,
    teacher_name,
    phone_number,
  };

  console.log("📌 ข้อมูลที่ส่งไป API:", dataToSend);

  try {
    const response = await fetch(
      `${API_URL}/booker//submitBookingIntimeTeacher`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(dataToSend),
      }
    );

    const result = await response.json();
    console.log("📌 ผลลัพธ์จาก API:", result);

    if (result.success) {
      await Swal.fire({
        icon: "success",
        title: "จองห้องสำเร็จ",
        text: "ระบบได้บันทึกการจองของคุณเรียบร้อยแล้ว",
        confirmButtonText: "ตกลง",
      });
      window.location.href = "home.html";
    } else {
      Swal.fire("เกิดข้อผิดพลาด", result.error || "ไม่สามารถจองได้", "error");
    }
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาด:", error);
    Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถติดต่อเซิร์ฟเวอร์ได้", "error");
  }
}

async function loadEquipmentDetails() {
  console.log("🔄 กำลังโหลดข้อมูลอุปกรณ์...");

  // ดึงค่าพารามิเตอร์จาก URL
  const urlParams = new URLSearchParams(window.location.search);
  const equipmentsParam = urlParams.get("equipments"); // เช่น "12:1,13:2"

  console.log("📌 Equipments Param:", equipmentsParam);

  if (!equipmentsParam) {
    console.warn("❌ ไม่พบค่าอุปกรณ์จาก URL");
    return;
  }

  // โหลดข้อมูลอุปกรณ์จาก API
  const equipmentMapping = await loadEquipmentMapping();

  let equipmentTableRows = "";
  const equipmentItems = equipmentsParam.split(",");

  equipmentItems.forEach((item) => {
    const [id, amount] = item.split(":");
    const name = equipmentMapping[id] || `ไม่พบข้อมูลอุปกรณ์ (${id})`;
    equipmentTableRows += `<tr>
            <td>${name}</td>
            <td>${amount}</td>
        </tr>`;
  });

  console.log("✅ อุปกรณ์ที่โหลดสำเร็จ:", equipmentTableRows);

  document.getElementById("equipment-table-body").innerHTML =
    equipmentTableRows;
}
document.addEventListener("DOMContentLoaded", async function () {
  await loadEquipmentDetails();
});

// ✅ เรียกใช้ฟังก์ชันเมื่อโหลดหน้าเว็บ
window.onload = function () {
  setTimeout(fetchTeacherInfo, 500); // รอ 0.5 วินาที
};
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  sidebar.classList.toggle("active");
  overlay.classList.add("active");
}

function openModal() {
  const modal = document.getElementById("modal");
  const overlay = document.getElementById("overlay");
  modal.classList.add("active");
  overlay.classList.add("active");
}

function closeSidebarOrModal() {
  const sidebar = document.getElementById("sidebar");
  const modal = document.getElementById("modal");
  const overlay = document.getElementById("overlay");

  if (sidebar.classList.contains("active")) {
    sidebar.classList.remove("active");
  }

  if (modal.classList.contains("active")) {
    modal.classList.remove("active");
  }

  overlay.classList.remove("active");
}

function saveData() {
  const modal = document.getElementById("modal");
  const rows = document.querySelectorAll("#modal tbody tr");
  const tableBody = document.querySelector(
    ".table.table-bordered:nth-of-type(2) tbody"
  );

  rows.forEach((row) => {
    const equipmentName = row.cells[0].innerText;
    const equipmentQty = parseInt(row.cells[1].querySelector("input").value);

    let existingRow = Array.from(tableBody.rows).find(
      (r) => r.cells[0].innerText === equipmentName
    );

    if (equipmentQty > 0) {
      if (existingRow) {
        existingRow.cells[2].innerText = equipmentQty;
      } else {
        const newRow = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.innerText = equipmentName;
        newRow.appendChild(nameCell);

        const roomCell = document.createElement("td");
        roomCell.innerText = "SC2-308";
        newRow.appendChild(roomCell);

        const qtyCell = document.createElement("td");
        qtyCell.innerText = equipmentQty;
        newRow.appendChild(qtyCell);

        tableBody.appendChild(newRow);
      }
    } else if (existingRow) {
      tableBody.removeChild(existingRow);
    }
  });

  modal.classList.remove("active");
  closeSidebarOrModal();
}
// ✅ ฟังก์ชันแปลงวันที่ YYYY-MM-DD → DD/MM/YYYY
function formatDateForDisplay(dateStr) {
  if (!dateStr) return "ไม่พบข้อมูล";
  const parts = dateStr.split("-");
  return `${parts[2]}/${parts[1]}/${parts[0]}`; // 2025-02-27 → 27/02/2025
}

async function loadRoomDetails(roomId) {
  try {
    const response = await fetch(`${API_URL}/booker/roomdetail`);
    if (!response.ok) throw new Error("HTTP error " + response.status);
    const rooms = await response.json();

    // หา room ที่ room_id ตรงกับ roomParam
    const roomDetail = rooms.find((room) => room.room_id == roomId);
    console.log("✅ Room Detail:", roomDetail);

    if (roomDetail) {
      document.getElementById("room-info").textContent =
        roomDetail.room_name || "ไม่พบข้อมูล";
      document.getElementById("room-type-info").textContent =
        roomDetail.room_type || "ไม่พบข้อมูล";
    } else {
      document.getElementById("room-info").textContent = "ไม่พบข้อมูล";
      document.getElementById("room-type-info").textContent = "ไม่พบข้อมูล";
    }
  } catch (err) {
    console.error("❌ Error fetching room details:", err);
    document.getElementById("room-info").textContent = "ไม่พบข้อมูล";
    document.getElementById("room-type-info").textContent = "ไม่พบข้อมูล";
  }
}

function displaySelectedComputers() {
  const urlParams = new URLSearchParams(window.location.search);
  const desksParam = urlParams.get("desks");
  const roomId = urlParams.get("room");
  const computerTableBody = document.getElementById("computer-table-body");

  if (!desksParam) {
    computerTableBody.innerHTML = `<tr><td colspan="2">ไม่มีการเลือกคอมพิวเตอร์</td></tr>`;
    return;
  }

  const deskItems = desksParam.split(",").map((d) => parseInt(d.trim(), 10));

  // ✅ ปรับแถวละ 10 ตัว (ตามจริง)
  let desksPerRow = 10;
  if (roomId === "308") desksPerRow = 6;

  let rowMap = {};
  deskItems.forEach((desk) => {
    const row = Math.ceil(desk / desksPerRow);
    if (!rowMap[row]) rowMap[row] = [];
    rowMap[row].push(desk);
  });

  const sortedRows = Object.keys(rowMap).sort((a, b) => a - b);
  computerTableBody.innerHTML = sortedRows
    .map(
      (row) =>
        `<tr><td>แถวที่ ${row}</td><td>${rowMap[row]
          .sort((a, b) => a - b)
          .join(", ")}</td></tr>`
    )
    .join("");
}

// ✅ โหลดข้อมูลห้องและเวลาเมื่อหน้าเว็บโหลด
document.addEventListener("DOMContentLoaded", async function () {
  const urlParams = new URLSearchParams(window.location.search);
  const roomParam = urlParams.get("room"); // เช่น "307"
  const dateParam = urlParams.get("date"); // เช่น "2025-02-27"
  const startTimeParam = urlParams.get("startTime"); // เช่น "12:00:00"
  const endTimeParam = urlParams.get("endTime"); // เช่น "13:00:00"
  const desksParam = urlParams.get("desks");

  console.log("📌 Room Param from URL:", roomParam);
  console.log("📌 Date Param from URL:", dateParam);

  // โหลดข้อมูลห้อง
  await loadRoomDetails(roomParam);

  displaySelectedComputers(desksParam);

  // ✅ แสดงวันที่จอง
  document.getElementById("booking-date-info").textContent =
    formatDateForDisplay(dateParam);

  // ✅ แสดงช่วงเวลาที่จอง
  const formattedStartTime = formatTimeForDisplay(startTimeParam);
  const formattedEndTime = formatTimeForDisplay(endTimeParam);
  document.getElementById(
    "time-range-info"
  ).textContent = `${formattedStartTime}-${formattedEndTime} น.`;
});

// ✅ ฟังก์ชันแปลงเวลาให้แสดง 12.00 น. แทน 12:00:00
function formatTimeForDisplay(timeStr) {
  if (!timeStr) return "ไม่พบข้อมูล";
  const parts = timeStr.split(":");
  return `${parseInt(parts[0], 10)}.${parts[1]}`;
}

// เพิ่มฟังก์ชันตรวจจับการเปลี่ยนของ Radio Button
document
  .querySelectorAll('input[name="booking-type"]')
  .forEach(function (radio) {
    radio.addEventListener("change", function () {
      if (this.value === "นอกเวลา") {
        // เมื่อเลือก "นอกเวลา" ให้ไปที่ TimeOut2Teacher.html
        window.location.href = "./TimeOut3Teacher.html";
      } else if (this.value === "ในเวลา") {
        // เมื่อเลือก "ในเวลา" ให้คงอยู่ในหน้านี้
        window.location.href = "./TimeInTeacher.html";
      }
    });
  });
