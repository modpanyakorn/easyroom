// Toggle sidebar
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
}

// เปลี่ยนเส้นทางตาม Radio Button เมื่อเปลี่ยนสถานะ
document
  .querySelectorAll('input[name="booking-type"]')
  .forEach(function (radio) {
    radio.addEventListener("change", function () {
      if (this.value === "นอกเวลา") {
        window.location.href = "./TimeOut.html";
      } else if (this.value === "ในเวลา") {
        window.location.href = "./TimeIn.html";
      }
    });
  });

// ฟังก์ชันแปลงเวลา เช่น "08:00:00" -> "8.00"
function formatTimeForDisplay(timeStr) {
  if (!timeStr) return "ไม่พบข้อมูล";

  const parts = timeStr.split(":");
  if (parts.length < 2) return "ไม่พบข้อมูล";

  let hour = parts[0];
  const minute = parts[1];
  if (hour.startsWith("0")) hour = hour.substring(1);
  return hour + "." + minute;
}

// ดึงรายละเอียดห้อง
async function loadRoomDetails(roomId) {
  try {
    const response = await fetch(`${API_URL}/booker/roomdetail`);
    if (!response.ok) throw new Error("HTTP error " + response.status);
    const rooms = await response.json();

    const roomDetail = rooms.find((room) => room.room_id == roomId);
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

// ฟังก์ชันแสดงคอมพิวเตอร์ที่เลือก
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

// ฟังก์ชันดึงข้อมูลผู้ใช้จากเซสชัน
async function fetchUserInfo() {
  try {
    const response = await fetch(`${API_URL}/auth/session`, {
      credentials: "include",
    });

    const userSession = await response.json();
    if (!userSession.data) {
      alert("กรุณาเข้าสู่ระบบใหม่");
      window.location.href = "login.html";
      return;
    }

    console.log("✅ ข้อมูลผู้ใช้จาก session:", userSession.data);

    // เติมค่าลง input โดยใช้ key ที่ถูกต้อง
    document.getElementById("student-name").value =
      userSession.data.full_name || "ไม่พบข้อมูล";
    document.getElementById("student-id").value =
      userSession.data.student_id || "ไม่พบข้อมูล";
    document.getElementById("stud-year").value =
      userSession.data.study_year || "ไม่พบข้อมูล";
    document.getElementById("phone-number").value =
      userSession.data.phone_number || "ไม่พบข้อมูล"; // ตรวจสอบให้แน่ใจว่า backend ส่งค่ามา
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้:", error);
  }
}

// ฟังก์ชันเพิ่ม-ลบแถวสมาชิก
function addRow() {
  const tableBody = document.getElementById("members-table-body");
  const newRow = document.createElement("tr");
  newRow.innerHTML = `
    <td style="position: relative;">
      <input type="text" class="form-control student-id-input" placeholder="กรอกรหัสนิสิต" pattern="\\d*" title="กรุณากรอกเฉพาะตัวเลข">
      <div class="dropdown-list"></div>
    </td>
    <td><input type="text" class="form-control student-name-input" placeholder="กรอกชื่อ-นามสกุล" readonly></td>
    <td><button type="button" class="btn btn-danger" onclick="deleteRow(this)">ลบ</button></td>
  `;
  tableBody.appendChild(newRow);

  const input = newRow.querySelector(".student-id-input");
  initializeStudentIDInput(input); // เปิด dropdown พร้อมฟิลเตอร์คนที่ยังไม่ถูกเลือก
}

function deleteRow(button) {
  const row = button.closest("tr");
  row.remove();
}

// ดึงข้อมูลนิสิตเพื่อ filter
let studentData = [];
async function fetchStudentData() {
  try {
    const response = await fetch(`${API_URL}/booker/data/student`);

    // สมมติว่า URL เป็น /data/student
    // หรือจะเป็น URL อื่น ๆ ตามที่คุณสร้าง
    if (!response.ok) throw new Error("HTTP error " + response.status);

    studentData = await response.json();
    console.log("✅ ดึงข้อมูลนิสิตสำเร็จ:", studentData);
  } catch (error) {
    console.error("❌ ดึงข้อมูลล้มเหลว:", error);
  }
}

// ฟังก์ชัน filter รายชื่อนิสิต
function filterStudentList(inputElement) {
  let value = inputElement.value.trim();
  let dropdown = inputElement.nextElementSibling;
  let row = inputElement.closest("tr");
  let nameInput = row.querySelector(".student-name-input");

  dropdown.innerHTML = "";
  dropdown.style.display = "none";
  if (value === "") return;

  // ✅ เก็บรหัสนิสิตที่กรอกแล้วทั้งหมดในตาราง
  const usedIds = Array.from(document.querySelectorAll(".student-id-input"))
    .filter((input) => input !== inputElement) // ยกเว้นตัวที่กรอกอยู่
    .map((input) => input.value.trim())
    .filter((id) => id !== "");

  // ✅ ฟิลเตอร์จาก studentData
  let filtered = studentData.filter(
    (student) =>
      student.student_id.startsWith(value) &&
      !usedIds.includes(student.student_id)
  );

  if (filtered.length === 0) return;

  dropdown.style.display = "block";
  filtered.forEach((student) => {
    let option = document.createElement("div");
    option.classList.add("dropdown-item");
    option.style.padding = "5px";
    option.innerHTML = `<span style="font-size: 16px;">${student.student_id} - ${student.full_name}</span>`;

    option.addEventListener("mouseover", () => {
      option.style.fontWeight = "bold";
      option.style.backgroundColor = "#f0f0f0";
    });
    option.addEventListener("mouseout", () => {
      option.style.fontWeight = "normal";
      option.style.backgroundColor = "#fff";
    });

    option.addEventListener("click", () => {
      inputElement.value = student.student_id;
      nameInput.value = student.full_name;
      dropdown.style.display = "none";
    });

    dropdown.appendChild(option);
  });
}

// ฟังก์ชันเปิดการ filter ให้ช่อง student-id
function initializeStudentIDInput(inputElement) {
  let dropdown = inputElement.nextElementSibling;
  inputElement.addEventListener("input", function () {
    filterStudentList(inputElement);
  });
  inputElement.addEventListener("blur", () => {
    setTimeout(() => (dropdown.style.display = "none"), 200);
  });
}

// ฟังก์ชันโหลดข้อมูลอุปกรณ์
let isEquipmentLoaded = false;
async function fetchEquipmentInfo() {
  if (isEquipmentLoaded) {
    console.log("⚠️ ข้อมูลอุปกรณ์โหลดแล้ว ไม่โหลดซ้ำ");
    return;
  }
  isEquipmentLoaded = true;
  console.log("🔄 กำลังโหลดข้อมูลอุปกรณ์...");

  const params = new URLSearchParams(window.location.search);
  let equipmentData = params.get("equipments");

  if (!equipmentData) {
    console.warn("❌ ไม่พบค่า `equipments` ใน URL");
    return;
  }

  const decodedEquipmentData = decodeURIComponent(equipmentData).replace(
    /%2C/g,
    ","
  );
  console.log("📌 ค่าที่ได้จาก URL:", decodedEquipmentData);

  const equipmentDetails = decodedEquipmentData
    .split(",")
    .map((item) => {
      const parts = item.split(":");
      if (parts.length !== 2) return null;
      return {
        id: parts[0].trim(),
        amount: parts[1].trim(),
      };
    })
    .filter((item) => item !== null);

  if (equipmentDetails.length === 0) {
    console.warn("❌ รูปแบบข้อมูล `equipments` ไม่ถูกต้อง");
    return;
  }

  console.log("✅ ข้อมูลอุปกรณ์จาก URL:", equipmentDetails);

  try {
    const response = await fetch(`${API_URL}/booker/getEquipmentInformation`);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const equipmentList = await response.json();

    if (!Array.isArray(equipmentList) || equipmentList.length === 0) {
      console.warn("❌ ไม่พบข้อมูลอุปกรณ์ในฐานข้อมูล");
      return;
    }

    console.log("✅ ข้อมูลอุปกรณ์จากฐานข้อมูล:", equipmentList);

    const tableBody = document.getElementById("equipment-table-body");
    tableBody.innerHTML = ""; // เคลียร์ก่อน

    equipmentDetails.forEach((equip) => {
      const equipmentInfo = equipmentList.find(
        (e) => String(e.equipment_id) === equip.id
      );
      if (!equipmentInfo) return;

      // ตรวจสอบว่า row นี้มีแล้วหรือยัง
      if (
        !document.querySelector(
          `#equipment-table-body tr[data-id='${equip.id}']`
        )
      ) {
        const row = document.createElement("tr");
        row.setAttribute("data-id", equip.id);
        row.innerHTML = `

            <td>${equipmentInfo.equipment_name}</td>
            <td>SC2-${params.get("room")}</td>
            <td>${equip.amount}</td>
          `;
        console.log(
          "✅ เพิ่มอุปกรณ์:",
          equipmentInfo.equipment_name,
          "จำนวน:",
          equip.amount
        );
        tableBody.appendChild(row);
      } else {
        console.log("⚠️ อุปกรณ์นี้มีอยู่แล้ว:", equipmentInfo.equipment_name);
      }
    });
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการดึงข้อมูลอุปกรณ์:", error);
  }
}

async function loadEquipmentDetails() {
  if (isEquipmentLoaded) {
    console.log("⚠️ ข้อมูลอุปกรณ์โหลดแล้ว ไม่โหลดซ้ำ");
    return;
  }
  console.log("🔄 กำลังโหลดข้อมูลอุปกรณ์...");
  isEquipmentLoaded = true;

  // โค้ดส่วนนี้จะไปเรียก fetchEquipmentInfo() หรือทำการโหลดเองก็ได้
  await fetchEquipmentInfo();
}

// ฟังก์ชันเริ่มต้นเมื่อ DOM โหลดแล้ว
document.addEventListener("DOMContentLoaded", async function () {
  // โหลดข้อมูลผู้ใช้
  await fetchUserInfo();
  // โหลดข้อมูลนิสิตสำหรับ filter
  await fetchStudentData();
  // โหลดอุปกรณ์
  await fetchEquipmentInfo();
  await loadEquipmentDetails();

  // ดึงค่าพารามฯ
  const params = new URLSearchParams(window.location.search);
  const roomParam = params.get("room");
  const startTimeParam = params.get("startTime");
  const endTimeParam = params.get("endTime");
  const desksParam = params.get("desks");

  // โหลดรายละเอียดห้อง
  if (roomParam) {
    loadRoomDetails(roomParam);
  }

  // แสดงเวลา
  if (startTimeParam && endTimeParam) {
    const formattedStartTime = formatTimeForDisplay(startTimeParam);
    const formattedEndTime = formatTimeForDisplay(endTimeParam);
    document.getElementById(
      "time-range-info"
    ).textContent = `${formattedStartTime}-${formattedEndTime} น.`;
  } else {
    document.getElementById("time-range-info").textContent = "ไม่พบข้อมูลเวลา";
  }

  // แสดงข้อมูลคอมพิวเตอร์
  displaySelectedComputers(desksParam);

  // จัดการ event สำหรับ student-id-input
  document.querySelectorAll(".student-id-input").forEach((inputElement) => {
    initializeStudentIDInput(inputElement);
  });

  // ป้องกันกรณีข้อมูลอุปกรณ์หาย ให้โหลดซ้ำอีกครั้ง
  setTimeout(async () => {
    console.log("🔄 โหลดข้อมูลอุปกรณ์ซ้ำเพื่อป้องกันหาย");
    await fetchEquipmentInfo();
  }, 2000);
});

async function submitBookingOut() {
  const studentId = document.getElementById("student-id").value;
  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get("room");
  const usedDate = urlParams.get("date");
  const startTime = urlParams.get("startTime");
  const endTime = urlParams.get("endTime");
  const desks = urlParams.get("desks")
    ? urlParams.get("desks").split(",").map(Number)
    : [];
  const equipments = urlParams.get("equipments") || "";
  const reasonElement = document.querySelector("select[name='usage']");
  const reason = reasonElement ? reasonElement.value.trim() : "ไม่ระบุ";
  const detail_request_reason =
    document.getElementById("additional-details").value || null;
  const requestType = "นอกเวลา";

  const memberInputs = document.querySelectorAll(".student-id-input");
  const members = Array.from(memberInputs)
    .map((input) => input.value.trim())
    .filter((id) => id !== "" && id !== studentId);

  // ตรวจสอบความครบถ้วนของข้อมูล
  if (!studentId || !roomId || !usedDate || !startTime || !endTime || !reason) {
    alert("⚠️ กรุณากรอกข้อมูลให้ครบ");
    return;
  }

  // 🔽 แสดง SweetAlert เพื่อยืนยันข้อมูล
  const roomType = document.getElementById("room-type-info").textContent;
  const roomName = document.getElementById("room-info").textContent;
  const timeRange = document.getElementById("time-range-info").textContent;
  const formattedDate = usedDate; // แสดง yyyy-mm-dd เหมือนในภาพ

  const confirmResult = await Swal.fire({
    title: "<strong>ยืนยันการจอง</strong>",
    icon: "warning",
    html: `
  <div style="font-size: 16px; text-align: center;">
    <b>วันที่จอง:</b> ${formattedDate}<br>
    <b>เวลาที่จอง:</b> ${timeRange}<br>
    <b>ห้องที่จอง:</b> ${roomName} (${roomType})<br><br>
    <span style="color: red;">หากยืนยันแล้วจะไม่สามารถเปลี่ยนแปลงได้</span>
  </div>
`,
    showCancelButton: true,
    confirmButtonText: "ยืนยัน",
    cancelButtonText: "ยกเลิก",
    confirmButtonColor: "#673ab7",
    cancelButtonColor: "#616161",
    reverseButtons: false,
  });

  if (!confirmResult.isConfirmed) return;

  // 🔽 สร้างข้อมูลเพื่อส่งไป API
  const bookingData = {
    room_id: roomId,
    used_date: usedDate,
    student_id: studentId,
    start_time: startTime,
    end_time: endTime,
    desks: desks,
    equipments: equipments,
    request_type: requestType,
    request_reason: reason,
    detail_request_reason: detail_request_reason,
    members: members,
  };

  console.log("📌 ข้อมูลที่ส่งไป API:", bookingData);

  try {
    const response = await fetch(`${API_URL}/booker/submitBookingOuttime`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(bookingData),
    });

    const result = await response.json();
    console.log("📌 ผลลัพธ์จาก API:", result);

    if (response.ok) {
      await Swal.fire({
        icon: "success",
        title: "จองสำเร็จ",
        text: "ระบบได้บันทึกการจองของคุณเรียบร้อยแล้ว",
        confirmButtonText: "ตกลง",
      });
      window.location.href = "home.html";
    } else {
      Swal.fire("เกิดข้อผิดพลาด", result.error || "ไม่สามารถจองได้", "error");
    }
  } catch (err) {
    console.error("❌ เกิดข้อผิดพลาดในการส่งข้อมูล:", err);
    Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถติดต่อเซิร์ฟเวอร์ได้", "error");
  }
}
