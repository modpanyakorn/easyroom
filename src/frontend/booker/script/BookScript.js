// ✅ ฟังก์ชันแนบ event กับปุ่มห้องเรียน
function attachRoomClickEvents() {
  document.addEventListener("click", (event) => {
    const roomElement = event.target.closest(".room"); // เช็คว่าคลิกที่ .room หรือไม่
    if (!roomElement) return;

    const roomName = roomElement.dataset.room; // ดึงค่า room จาก data-room

    if (!roomName) return;
    // ตรวจสอบว่าเป็นห้องพิเศษหรือไม่
    if (roomElement.dataset.special === "true") {
      // เรียกใช้ SweetAlert สำหรับห้อง 212
      Swal.fire({
        title: "ห้อง SC2-" + roomName,
        text: "ขออภัย ห้องนี้ไม่สามารถจองผ่านระบบได้ กรุณาติดต่อเจ้าหน้าที่",
        icon: "info",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "ตกลง",
      });
      return; // หยุดการทำงานของฟังก์ชันนี้
    }

    localStorage.setItem("selectedRoom", roomName);
    window.location.href = `Schedule.html?room=${encodeURIComponent(roomName)}`;
  });
}

// ✅ ดึงสถานะห้องจากฐานข้อมูล
async function fetchRoomStatus() {
  try {
    const response = await fetch(`${API_URL}/booker/rooms`);
    if (!response.ok) throw new Error("Failed to fetch room data");

    const rooms = await response.json();
    console.log("✅ ห้องที่ดึงมา:", rooms);

    const allRoomElements = document.querySelectorAll(".room");

    allRoomElements.forEach((roomElement) => {
      const roomId = roomElement.dataset.room;
      if (!roomId) return;

      const roomData = rooms.find((r) => r.room_id === roomId);
      if (!roomData) return;

      let statusElement = roomElement.querySelector(".status");
      if (!statusElement) {
        statusElement = document.createElement("div");
        statusElement.classList.add("status");
        roomElement.appendChild(statusElement);
      }

      if (roomData.room_status.trim() === "เปิดการใช้งาน") {
        statusElement.textContent = "ว่าง";
        statusElement.classList.remove("not");
        roomElement.style.backgroundColor = "#8e8e8e";
        roomElement.classList.add("available");
        roomElement.classList.remove("disabled-room", "no-data");
        roomElement.style.cursor = "pointer";
      } else {
        statusElement.textContent = "ไม่ว่าง";
        statusElement.classList.add("not");
        roomElement.classList.add("disabled-room");
        roomElement.classList.remove("available", "no-data");
        roomElement.style.backgroundColor = "#8e8e8e";
        roomElement.style.cursor = "not-allowed";
      }
    });
  } catch (error) {
    console.error("❌ Error loading room status:", error);
  }
}

// ✅ ดึงไอคอนประเภทห้อง
async function fetchRoomTypeIcon() {
  try {
    const response = await fetch(`${API_URL}/booker/roomdetail`);
    if (!response.ok) throw new Error("ไม่สามารถดึงข้อมูล room type ได้");

    const rooms = await response.json();
    console.log("📦 Room type data:", rooms);

    const typeIcons = {
      ห้องเลคเชอร์: "fas fa-chalkboard-teacher",
      ห้องปฏิบัติการ: "fas fa-laptop-code",
      ห้องปฎิบัติการ: "fas fa-laptop-code", // รองรับคำสะกดผิดด้วย
      "co-working space": "fas fa-users",
      "studio room": "fas fa-video",
      ห้องค้นคว้า: "fas fa-book",
    };

    rooms.forEach((room) => {
      const roomId = room.room_id?.trim(); // ตัดช่องว่าง
      const normalizedType = room.room_type?.trim().toLowerCase();

      const roomElement = document.querySelector(
        `.room[data-room="${roomId}"]`
      );
      const iconClass = typeIcons[normalizedType];

      if (roomElement && iconClass) {
        const icon = document.createElement("i");
        icon.className = `${iconClass} room-type-icon`;
        roomElement.classList.add("has-icon");
        roomElement.appendChild(icon);
      } else {
        console.warn("⛔ ไม่พบ room หรือ icon:", roomId, room.room_type);
      }
    });
  } catch (err) {
    console.error("❌ Failed to load room type icons:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  fetchRoomStatus();
  fetchRoomTypeIcon();
  attachRoomClickEvents();
});
