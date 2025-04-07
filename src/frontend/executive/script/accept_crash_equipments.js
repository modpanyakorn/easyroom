// ฟังก์ชันสำหรับแสดง badge สถานะพร้อม icon
function getStatusBadge(status) {
  switch (status) {
    case "รอซ่อม":
      return '<span class="badge bg-danger"><i class="fa fa-clock"></i> รอซ่อม</span>';
    case "รับเรื่องแล้ว":
      return '<span class="badge bg-primary"><i class="fa fa-check"></i> รับเรื่องแล้ว</span>';
    case "กำลังซ่อม":
      return '<span class="badge bg-warning text-dark"><i class="fa fa-tools"></i> กำลังซ่อม</span>';
    case "กำลังจัดซื้อ":
      return '<span class="badge bg-info text-dark"><i class="fa fa-shopping-cart"></i> กำลังจัดซื้อ</span>';
    case "ซ่อมสำเร็จ":
      return '<span class="badge bg-success"><i class="fa fa-check-circle"></i> ซ่อมสำเร็จ</span>';
    default:
      return '<span class="badge bg-secondary">' + status + "</span>";
  }
}
async function fetchEquipmentTypes() {
  try {
    const brokenResponse = await fetch(
      `${API_URL}/executive/equipment_brokened`
    );
    const brokenData = await brokenResponse.json();
    const equipmentResponse = await fetch(`${API_URL}/executive/equipment`);
    const equipmentData = await equipmentResponse.json();
    const equipmentMap = new Map();
    equipmentData.forEach((item) => {
      equipmentMap.set(item.equipment_id, item.equipment_name);
    });
    const uniqueTypes = [
      ...new Set(brokenData.map((item) => equipmentMap.get(item.equipment_id))),
    ];
    const typeFilter = document.getElementById("typeFilter");
    typeFilter.innerHTML = '<option value="all">ทั้งหมด</option>';
    uniqueTypes.forEach((type) => {
      const option = document.createElement("option");
      option.value = type;
      option.textContent = type;
      typeFilter.appendChild(option);
    });
  } catch (error) {
    console.error("❌ Fetch Equipment Types Error:", error);
  }
}
async function fetchRoomOptions() {
  try {
    const brokenResponse = await fetch(
      `${API_URL}/executive/equipment_brokened`
    );
    const brokenData = await brokenResponse.json();
    const uniqueRooms = [...new Set(brokenData.map((item) => item.room_id))];
    const roomFilter = document.getElementById("roomFilter");
    roomFilter.innerHTML = '<option value="all">ทั้งหมด</option>';
    uniqueRooms.forEach((roomId) => {
      const option = document.createElement("option");
      option.value = roomId;
      option.textContent = `SC2 - ${roomId}`;
      roomFilter.appendChild(option);
    });
  } catch (error) {
    console.error("❌ Fetch Room Options Error:", error);
  }
}
async function fetchData() {
  try {
    const [
      brokenResponse,
      studentResponse,
      teachersResponse,
      equipmentsResponse,
    ] = await Promise.all([
      fetch(`${API_URL}/executive/equipment_brokened`),
      fetch(`${API_URL}/executive/student`),
      fetch(`${API_URL}/executive/teacher`),
      fetch(`${API_URL}/executive/equipment`),
    ]);
    const brokenData = await brokenResponse.json();
    const studentData = await studentResponse.json();
    const teachersData = await teachersResponse.json();
    const equipmentsData = await equipmentsResponse.json();
    let mergedData = brokenData.map((item) => {
      const student =
        studentData.find((s) => s.student_id === item.student_id) || {};
      const teacher =
        teachersData.find((t) => t.teacher_id === item.teacher_id) || {};
      const equipment =
        equipmentsData.find((e) => e.equipment_id === item.equipment_id) || {};
      return {
        ...item,
        repairDate: item.repair_date
          ? new Date(item.repair_date).toLocaleDateString("th-TH", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          : "-",
        email: student.email || teacher.email || "-",
        person_name: student.full_name || teacher.full_name || "-",
        equipmentName: equipment.equipment_name || "ไม่พบชื่ออุปกรณ์",
        equipmentType: equipment.equipment_type || "ไม่ระบุประเภท",
        damageDetails: item.damage_details || "-",
        imagePath: item.image_path
          ? `${API_URL}/executive/image/${item.image_path}`
          : null,
      };
    });
    // กรองเฉพาะรายการที่สถานะเป็น รับเรื่องแล้ว, กำลังซ่อม หรือ กำลังจัดซื้อ
    mergedData = mergedData.filter(
      (item) =>
        item.repair_status === "รับเรื่องแล้ว" ||
        item.repair_status === "กำลังซ่อม" ||
        item.repair_status === "กำลังจัดซื้อ"
    );
    // โหลดข้อมูลทั้งหมดตอนเริ่มต้น
    filterData("all", "all", "", mergedData);
    document
      .getElementById("typeFilter")
      .addEventListener("change", function () {
        const selectedType = this.value;
        const selectedRoom = document.getElementById("roomFilter").value;
        const selectedDate = document.getElementById("reportDate").value;
        filterData(selectedType, selectedRoom, selectedDate, mergedData);
      });
    document
      .getElementById("roomFilter")
      .addEventListener("change", function () {
        const selectedType = document.getElementById("typeFilter").value;
        const selectedRoom = this.value;
        const selectedDate = document.getElementById("reportDate").value;
        filterData(selectedType, selectedRoom, selectedDate, mergedData);
      });
    document
      .getElementById("reportDate")
      .addEventListener("change", function () {
        const selectedType = document.getElementById("typeFilter").value;
        const selectedRoom = document.getElementById("roomFilter").value;
        const selectedDate = this.value;
        filterData(selectedType, selectedRoom, selectedDate, mergedData);
      });
    document
      .getElementById("sortOrder")
      .addEventListener("change", function () {
        const selectedType = document.getElementById("typeFilter").value;
        const selectedRoom = document.getElementById("roomFilter").value;
        const selectedDate = document.getElementById("reportDate").value;
        filterData(selectedType, selectedRoom, selectedDate, mergedData);
      });
  } catch (error) {
    console.error("❌ Fetch Error:", error);
  }
}
function filterData(selectedType, selectedRoom, selectedDate, data) {
  const equipmentContainer = document.getElementById("equipment-list");
  equipmentContainer.innerHTML = "";
  let filteredData = data;
  if (selectedType !== "all") {
    filteredData = filteredData.filter(
      (item) => item.equipmentName === selectedType
    );
  }
  if (selectedRoom !== "all") {
    filteredData = filteredData.filter((item) => item.room_id === selectedRoom);
  }
  if (selectedDate) {
    const formattedSelectedDate = new Date(selectedDate).toLocaleDateString(
      "th-TH",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );
    filteredData = filteredData.filter(
      (item) => item.repairDate === formattedSelectedDate
    );
  }
  const sortOrder = document.getElementById("sortOrder").value;
  filteredData = filteredData.sort((a, b) => {
    const dateParts_a = a.repairDate.split("/");
    const dateParts_b = b.repairDate.split("/");
    const dateA = new Date(
      parseInt(dateParts_a[2]) - 543,
      parseInt(dateParts_a[1]) - 1,
      parseInt(dateParts_a[0])
    );
    const dateB = new Date(
      parseInt(dateParts_b[2]) - 543,
      parseInt(dateParts_b[1]) - 1,
      parseInt(dateParts_b[0])
    );
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });
  if (filteredData.length === 0) {
    equipmentContainer.innerHTML =
      "<p class='text-muted'>ไม่มีข้อมูลที่ตรงกับเงื่อนไข</p>";
    return;
  }
  filteredData.forEach((item) => {
    const equipmentCard = `
      <div class="card my-3">
        <div class="card-header h5">${item.equipmentName}</div>
        <div class="card-body d-flex align-items-start">
          ${
            item.imagePath
              ? `<img src="${item.imagePath}" alt="ภาพอุปกรณ์ชำรุด" class="equipment-img me-3">`
              : ""
          }
          <div>
            <p><strong>${item.damageDetails}</strong></p>
            <p><strong>ห้อง:</strong> ${item.room_id}</p>
            <p><strong>ผู้แจ้ง:</strong> ${item.person_name}</p>
            <p><strong>อีเมล:</strong> ${item.email}</p>
            <p><strong>รายงานเมื่อ:</strong> ${item.repairDate}</p>
            <p><strong>สถานะ:</strong> ${getStatusBadge(item.repair_status)}</p>
          </div>
        </div>
      </div>
    `;
    equipmentContainer.innerHTML += equipmentCard;
  });
}
document.addEventListener("DOMContentLoaded", async function () {
  await fetchEquipmentTypes();
  await fetchRoomOptions();
  fetchData();
});
// โหลด Sidebar
fetch("sidebar.html")
  .then((resp) => resp.text())
  .then((html) => {
    document.getElementById("sidebar-container").innerHTML = html;
  })
  .then(() => {
    const btnStats = document.getElementById("btnBroken");
    btnStats.classList.add("btn-sidebar-active");
  })
  .catch((err) => console.error("Failed to load sidebar:", err));
// ตั้งค่า Event Listener สำหรับเปลี่ยนแท็บ
document.addEventListener("DOMContentLoaded", function () {
  const brokenTab = document.querySelector("#broken-tab");
  const successTab = document.querySelector("#success-tab");
  if (brokenTab) {
    brokenTab.addEventListener("click", function () {
      window.location.href = "crash_equipments_requests.html";
    });
  }
  if (successTab) {
    successTab.addEventListener("click", function () {
      window.location.href = "successful_equipments.html";
    });
  }
});
