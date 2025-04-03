// WebSocket connection
const socket = io(`${API_URL}`);
socket.on("connect", () => {
  console.log("WebSocket connected on TimeIn.html");
});
socket.on("booking_update", (data) => {
  console.log("Received booking update via WebSocket:", data);
});

async function fetchUserInfo() {
  try {
    const response = await fetch(`${API_URL}/auth/session`, {
      credentials: "include",
    });

    const userSession = await response.json();
    if (!userSession.data) {
      alert("กรุณาเข้าสู่ระบบใหม่");
      window.location.href = "../../index.html";
      return;
    }

    console.log("✅ ข้อมูลผู้ใช้จาก session:", userSession.data);

    // เติมค่าลง input โดยใช้ key ที่ถูกต้อง
    document.getElementById("student-name").value =
      userSession.data.full_name || "ไม่พบข้อมูล";
    document.getElementById("student-id").value =
      userSession.data.user_id || "ไม่พบข้อมูล";
    document.getElementById("stud-year").value =
      userSession.data.study_year || "ไม่พบข้อมูล";
    document.getElementById("phone-number").value =
      userSession.data.phone_number || "ไม่พบข้อมูล"; // ตรวจสอบให้แน่ใจว่า backend ส่งค่ามา
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้:", error);
  }
}

// Utility function: Format time from "08:00:00" to "8.00"
function formatTimeForDisplay(timeStr) {
  const parts = timeStr.split(":");
  let hour = parts[0];
  const minute = parts[1];
  if (hour.startsWith("0")) {
    hour = hour.substring(1);
  }
  return hour + "." + minute;
}
// Load equipment mapping from API /getEquipmentInformation
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

// Load room details from API /roomdetail
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
    console.error("Error fetching room details:", err);
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

// Main initialization

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

// ฟังก์ชันสำหรับ toggle sidebar
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
}

async function submitBookingA() {
  const urlParams = new URLSearchParams(window.location.search);
  const room_id = urlParams.get("room");
  const used_date = urlParams.get("date");
  const start_time = urlParams.get("startTime");
  const end_time = urlParams.get("endTime");

  const request_type = window.location.pathname.includes("TimeOut")
    ? "นอกเวลา"
    : "ในเวลา";
  const request_reason = document.querySelector("select[name='usage']").value;
  const detail_request_reason =
    document.getElementById("additional-details").value || null;

  const desks = urlParams.get("desks")
    ? urlParams.get("desks").split(",").map(Number)
    : [];
  const equipments = urlParams.get("equipments") || "";

  const student_name = document.getElementById("student-name")?.value || null;
  const phone_number = document.getElementById("phone-number")?.value || null;

  if (!room_id || !used_date || !start_time || !end_time || !request_reason) {
    Swal.fire("ข้อมูลไม่ครบ", "กรุณากรอกข้อมูลให้ครบ", "warning");
    return;
  }

  const roomText =
    document.getElementById("room-info")?.textContent || "ไม่พบข้อมูล";
  const roomType =
    document.getElementById("room-type-info")?.textContent || "-";
  const timeRange = `${formatTimeForDisplay(
    start_time
  )} - ${formatTimeForDisplay(end_time)} น.`;

  const confirmResult = await Swal.fire({
    title: "ยืนยันการจอง",
    html: `
    <strong>วันที่จอง:</strong> ${used_date}<br/>
    <strong>เวลาที่จอง:</strong> ${timeRange}<br/>
    <strong>ห้องที่จอง:</strong> ${roomText} (${roomType})<br/>
    <div style="color:red; margin-top:10px;">
    หากยืนยันแล้วจะไม่สามารถเปลี่ยนแปลงได้
    </div>
  `,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "ยืนยัน",
    cancelButtonText: "ยกเลิก",
  });

  if (!confirmResult.isConfirmed) return;

  try {
    const response = await fetch(`${API_URL}/booker/submitBookingIntime`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        room_id,
        used_date,
        start_time,
        end_time,
        request_type,
        request_reason,
        detail_request_reason,
        desks,
        equipments,
        student_name,
        phone_number,
      }),
    });

    const result = await response.json();
    if (result.success) {
      Swal.fire("สำเร็จ", "จองห้องสำเร็จ!", "success").then(() => {
        window.location.href = "../home.html";
      });
    } else {
      Swal.fire(
        "เกิดข้อผิดพลาด",
        result.error || "ไม่สามารถบันทึกการจองได้",
        "error"
      );
    }
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาด:", error);
    Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถเชื่อมต่อกับระบบ", "error");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  fetchUserInfo();
  // ดึง query parameters จาก URL
  const urlParams = new URLSearchParams(window.location.search);
  const dateParam = urlParams.get("date"); // รูปแบบ: yyyy-mm-dd
  const roomParam = urlParams.get("room"); // เช่น "307"
  const startTimeParam = urlParams.get("startTime"); // เช่น "08:00:00"
  const endTimeParam = urlParams.get("endTime"); // เช่น "17:00:00"
  const desksParam = urlParams.get("desks"); // เช่น "27,26,16"
  const equipmentsParam = urlParams.get("equipments"); // เช่น "12:1,13:1,14:1,15:1"
  console.log("📌 Room Param from URL:", roomParam);
  // แสดงข้อมูลพื้นฐาน
  document.getElementById("date-info").textContent = dateParam;
  await loadRoomDetails(roomParam);
  displaySelectedComputers(desksParam);
  const formattedStartTime = formatTimeForDisplay(startTimeParam);
  const formattedEndTime = formatTimeForDisplay(endTimeParam);
  document.getElementById(
    "time-range-info"
  ).textContent = `${formattedStartTime}-${formattedEndTime} น.`;
  //document.getElementById("desks-info").textContent = desksParam;

  // แสดงชื่อวันจากวันที่ใน URL
  if (dateParam) {
    const dateObj = new Date(dateParam);
    const daysArr = [
      "อาทิตย์",
      "จันทร์",
      "อังคาร",
      "พุธ",
      "พฤหัสบดี",
      "ศุกร์",
      "เสาร์",
    ];
    const dayName = daysArr[dateObj.getDay()];
    // document.getElementById("day-name").textContent = dayName;
  }

  // ดึง equipment mapping จาก API
  const equipmentMapping = await loadEquipmentMapping();
  let equipmentTableRows = "";
  if (equipmentsParam) {
    const equipmentItems = equipmentsParam.split(",");
    equipmentItems.forEach((item) => {
      const [id, amount] = item.split(":");
      const name = equipmentMapping[id] || id;
      equipmentTableRows += `<tr>
          <td>${name}</td>
          <td>${amount}</td>
        </tr>`;
    });
  }
  document.getElementById("equipment-table-body").innerHTML =
    equipmentTableRows;

  // Debug logging
  console.log("Received parameters:");
  console.log("Date:", dateParam);
  console.log("Start Time:", startTimeParam);
  console.log("End Time:", endTimeParam);
  console.log("Desks:", desksParam);
  console.log("Equipments (raw):", equipmentsParam);
  console.log("Equipment mapping:", equipmentMapping);
  console.log("Equipments (mapped HTML):", equipmentTableRows);
});
