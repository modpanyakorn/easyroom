function toggleMobileMenu() {
  const menu = document.getElementById("mobilePopupMenu");
  menu.style.display = menu.style.display === "flex" ? "none" : "flex";
}

window.addEventListener("click", function (e) {
  const menu = document.getElementById("mobilePopupMenu");
  const button = document.querySelector(".menu-toggle");
  if (!menu.contains(e.target) && !button.contains(e.target)) {
    menu.style.display = "none";
  }
});

document.addEventListener("DOMContentLoaded", function () {
  let visibleRows = 10;
  const increment = 5;
  let tableRows;
  function updateTableVisibility() {
    let tableRows = document.querySelectorAll("#booking-table-body tr");
    tableRows.forEach((row, index) => {
      row.style.display = index < visibleRows ? "table-row" : "none";
    });
    document.getElementById("load-more-btn").style.display =
      visibleRows >= tableRows.length ? "none" : "block";
  }
  document
    .getElementById("load-more-btn")
    .addEventListener("click", function () {
      visibleRows += increment;
      updateTableVisibility();
    });

  fetchUserBookingData();
  function formatDate(isoString) {
    if (!isoString) return "-";
    return isoString.split("T")[0];
  }

  async function fetchUserBookingData() {
    try {
      console.log("🔍 กำลังโหลดข้อมูลการจอง...");
      const sessionResponse = await fetch(`${API_URL}/auth/session`, {
        credentials: "include",
      });
      if (!sessionResponse.ok)
        throw new Error("❌ เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่");
      const userSession = await sessionResponse.json();
      console.log("✅ ข้อมูลเซสชันที่ได้:", userSession);
      const userId = userSession.data?.user_id;
      console.log("🎯 userId ที่ใช้เรียก API:", userId);
      if (!userId) throw new Error("❌ ไม่พบ user_id");
      const response = await fetch(`${API_URL}/booker/userBookings/${userId}`);
      if (!response.ok) throw new Error("❌ ไม่สามารถดึงข้อมูลการจองได้");
      const bookings = await response.json();
      console.log("✅ ข้อมูลการจองที่ได้รับ:", bookings);
      const tableBody = document.getElementById("booking-table-body");
      if (!tableBody) {
        console.error("❌ ไม่พบ element #booking-table-body");
        return;
      }
      tableBody.innerHTML = "";
      if (!Array.isArray(bookings) || bookings.length === 0) {
        console.warn("⚠️ ไม่มีข้อมูลการจอง");
        tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: red;">ไม่มีข้อมูลการจอง</td></tr>`;
        return;
      }
      bookings.sort(
        (a, b) => new Date(b.Submitted_date) - new Date(a.Submitted_date)
      );
      window.loadedBookingData = bookings;
      bookings.forEach((booking) => {
        const row = document.createElement("tr");
        row.setAttribute("data-id", booking.room_request_id);
        setTimeout(() => {
          document.querySelectorAll(".status").forEach((statusCell) => {
            let statusText = statusCell.textContent.trim();
            if (statusText === "อนุมัติ") {
              statusCell.style.color = "green";
            } else if (
              statusText === "ไม่อนุมัติ" ||
              statusText === "ยกเลิกการจอง"
            ) {
              statusCell.style.color = "red";
            } else if (
              statusText === "รออนุมัติ" ||
              statusText === "รอดำเนินการ"
            ) {
              statusCell.style.color = "orange";
            }
          });
        }, 1000);
        //console.log("📌 request_status ที่ได้:", booking.request_status);
        row.innerHTML = `
          <td>${booking.request_type || "-"}</td>
          <td>${booking.room_name || "-"}</td>
          <td>${formatDate(booking.Submitted_date) || "-"}</td>
          <td>${formatDate(booking.Used_date) || "-"}</td>
          <td>${booking.start_time || "-"}</td>
          <td>${booking.end_time || "-"}</td>
          <td class="status">${booking.request_status || "-"}</td>
          <td>
              ${
                booking.request_status === "รอดำเนินการ" ||
                booking.request_status === "รออนุมัติ"
                  ? `<button class="btn cancel-btn btn-sm" onclick="cancelBooking(${booking.room_request_id})">ยกเลิก</button>`
                  : booking.request_status === "ไม่อนุมัติ"
                  ? `<button class="btn detail-btn btn-sm" onclick="showRejectNote(${booking.room_request_id}, 'reject')">หมายเหตุ</button>`
                  : booking.request_status === "อนุมัติ"
                  ? `<button class="btn detail-btn btn-sm" onclick="showRejectNote(${booking.room_request_id}, 'approve')">หมายเหตุ</button>`
                  : "-"
              }
          </td>
      `;
        tableBody.appendChild(row);
      });
      updateTableVisibility();
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาด:", error);
      document.getElementById(
        "booking-table-body"
      ).innerHTML = `<tr><td colspan="8" style="text-align: center; color: red;">เกิดข้อผิดพลาดในการโหลดข้อมูล</td></tr>`;
    }
  }
});

function convertToThaiTime(utcDate) {
  if (!utcDate) return "-";
  const date = new Date(utcDate);
  date.setHours(date.getHours() + 7);
  return date.toISOString().slice(0, 10);
}
function showRejectNote(requestId, mode = "reject") {
  const bookings = window.loadedBookingData || [];
  const booking = bookings.find((b) => b.room_request_id === requestId);
  if (!booking) {
    alert("ไม่พบข้อมูลรายการนี้");
    return;
  }
  let content = "";
  if (mode === "reject") {
    content = `
        <p><strong>📍ห้องที่จอง : </strong> ${booking.room_name || "-"}</p>
        <p><strong>เหตุผลที่ไม่อนุมัติ : </strong> ${
          booking.reject_reason || "-"
        }</p>
        <p><strong>รายละเอียดเพิ่มเติม : </strong> ${
          booking.detail_reject_reason || "-"
        }</p>
        <hr>
        <p><strong>👤 ผู้อนุมัติ :</strong> ${
          booking.admin_name || booking.executive_name
        }</p>
      `;
  } else if (mode === "approve") {
    content = `
        <p><strong>📍ห้องที่จอง : </strong> ${booking.room_name || "-"}</p>
        <p><strong>👤 ผู้อนุมัติ : </strong> ${
          booking.admin_name || booking.executive_name
        }</p>
      `;
  }
  document.getElementById("rejectContent").innerHTML = content;
  document.getElementById("rejectModal").style.display = "block";
  document.getElementById("modalOverlay").style.display = "block";
}
function closeRejectModal() {
  document.getElementById("rejectModal").style.display = "none";
  document.getElementById("modalOverlay").style.display = "none";
}
// ฟังก์ชันยกเลิกการจองที่แก้ไขด้วย SweetAlert2
async function cancelBooking(requestId) {
  console.log(`🔍 กำลังส่ง requestId ไปที่ API: ${requestId}`);
  const row = document.querySelector(`tr[data-id="${requestId}"]`);
  if (!row) return;
  const statusCell = row.querySelector(".status");
  const statusText = statusCell.textContent.trim();
  if (statusText !== "รอดำเนินการ" && statusText !== "รออนุมัติ") {
    Swal.fire({
      icon: "error",
      title: "ไม่สามารถยกเลิก",
      text: "สามารถยกเลิกได้เฉพาะคำขอที่มีสถานะ 'รอดำเนินการ' หรือ 'รออนุมัติ' เท่านั้น",
    });
    return;
  }
  const result = await Swal.fire({
    title: "คุณต้องการยกเลิกการจองนี้ใช่หรือไม่?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "ใช่ ต้องการยกเลิก",
    cancelButtonText: "ไม่",
  });
  if (!result.isConfirmed) return;
  try {
    const response = await fetch(
      `${API_URL}/booker/cancelBooking/${requestId}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      }
    );
    const resultJson = await response.json();
    console.log("✅ ผลลัพธ์จากเซิร์ฟเวอร์:", resultJson);
    if (!response.ok) throw new Error(resultJson.error || "ไม่สามารถยกเลิกได้");
    statusCell.textContent = "ยกเลิกการจอง";
    statusCell.style.color = "red";
    row.querySelector("td:last-child").innerHTML = "-";
    if (window.loadedBookingData) {
      const bookingIndex = window.loadedBookingData.findIndex(
        (b) => b.room_request_id === requestId
      );
      if (bookingIndex !== -1) {
        window.loadedBookingData[bookingIndex].request_status = "ยกเลิกการจอง";
      }
    }
    Swal.fire({
      icon: "success",
      title: "ยกเลิกการจองสำเร็จ!",
      showConfirmButton: false,
      timer: 1500,
    });
  } catch (error) {
    console.error("❌ ไม่สามารถยกเลิกได้:", error);
    Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาด",
      text: "เกิดข้อผิดพลาด กรุณาลองใหม่",
    });
  }
}
async function fetchBrokenEquipments() {
  try {
    console.log("🔍 เรียก API /getBrokenEquipments...");
    const response = await fetch(`${API_URL}/booker/getBrokenEquipments`, {
      method: "GET",
      credentials: "include",
    });
    if (!response.ok) throw new Error("❌ ไม่สามารถดึงข้อมูลอุปกรณ์ที่เสียได้");
    const brokenEquipments = await response.json();
    console.log("✅ ข้อมูลที่ได้จาก API:", brokenEquipments);
    const tableBody = document.getElementById("repair-table-body");
    if (!tableBody) {
      console.error("❌ ไม่พบ element #repair-table-body");
      return;
    }
    tableBody.innerHTML = "";
    if (!Array.isArray(brokenEquipments) || brokenEquipments.length === 0) {
      console.warn("⚠️ ไม่มีข้อมูลที่ต้องแสดง");
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center;">ไม่มีข้อมูลการแจ้งซ่อม</td></tr>`;
      return;
    }
    brokenEquipments.forEach((item, index) => {
      console.log(`📌 เพิ่มแถวที่ ${index + 1}:`, item);
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${new Date(item.repair_date).toLocaleString("th-TH")}</td>
                <td>${item.equipment_name || "-"}</td>
                <td>${item.damage_details || "-"}</td>
                <td>${item.room_id || "-"}</td>
                <td>${item.Admin_Name}</td>
                <td class="status">${item.repair_status || "-"}</td>
                <td>
                    <button class="detail-btn" onclick="showDetails(${index}, 'repair')">รายละเอียด</button>
                </td>
            `;
      tableBody.appendChild(row);
    });
    window.brokenEquipmentsData = brokenEquipments;
    console.log("✅ ตารางอัปเดตเรียบร้อย!");
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการโหลดข้อมูล:", error);
  }
}
document.addEventListener("DOMContentLoaded", fetchBrokenEquipments);
function showDetails(index, type) {
  const modalTitle = document.getElementById("modalTitle");
  const detailsContainer = document.getElementById("detailsContainer");
  if (!modalTitle || !detailsContainer) {
    console.error("❌ ไม่พบ element #modalTitle หรือ #detailsContainer");
    return;
  }
  let detailsContent = "";
  if (type === "repair") {
    const item = window.brokenEquipmentsData[index];
    console.log("📌 ข้อมูลที่ดึงมา:", item);
    if (!item) {
      console.error("❌ ไม่พบข้อมูลสำหรับ index:", index);
      return;
    }
    let imageUrl = item.image_path
      ? `${API_URL}/booker/image/${item.image_path}`
      : "";
    modalTitle.innerText = "รายละเอียดการแจ้งซ่อม";
    detailsContent = `
          ${
            imageUrl
              ? `<img src="${imageUrl}" alt="ภาพอุปกรณ์ที่เสียหาย" style="width: 100%; max-width: 400px; border-radius: 8px; margin-top: 10px;">`
              : ""
          }
          <p><strong>🖥 ชื่ออุปกรณ์:</strong> ${item.equipment_name || "-"}</p>
          <p><strong>🔍 รายละเอียดเพิ่มเติม:</strong> ${item.damage || "-"}</p>
          <p><strong>🔍 ข้อความเพิ่มเติม:</strong> ${
            item.damage_details || "-"
          }</p>
          <p><strong>📍 ห้อง:</strong> ${item.room_id || "-"}</p>
          <p><strong>⚠️ สถานะ:</strong> ${item.repair_status || "-"}</p>
          <p><strong>👤 ผู้รับแจ้งซ่อม:</strong> ${
            item.Admin_Name || "รอผู้รับแจ้งซ่อม"
          }</p>
          <p><strong>📅 วันที่แจ้งซ่อม:</strong> ${new Date(
            item.repair_date
          ).toLocaleString("th-TH")}</p>
      `;
    console.log("📝 HTML ที่จะถูกแสดง:", detailsContent);
  }
  detailsContainer.innerHTML = detailsContent;
  document.getElementById("modalOverlay").style.display = "block";
  document.getElementById("detailsModal").style.display = "block";
}

function closeDetailsModal() {
  document.getElementById("modalOverlay").style.display = "none";
  document.getElementById("detailsModal").style.display = "none";
  document.getElementById("rejectModal").style.display = "none";
}
function openDetailsModal(index) {
  console.log("📌 เปิด Modal สำหรับ index:", index);
  if (!window.brokenEquipmentsData || !window.brokenEquipmentsData[index]) {
    console.error("❌ ไม่มีข้อมูลสำหรับ index:", index);
    return;
  }
  const item = window.brokenEquipmentsData[index];
  console.log("📌 ข้อมูลที่ดึงมา:", item);
  const repairDate = new Date(item.Repair_date).toLocaleString("th-TH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const detailsContainer = document.getElementById("detailsContainer");
  detailsContainer.innerHTML = `
      <div class="details-container">
          <div class="details-row"><strong>ผู้แจ้ง:</strong> ${item.Admin_Name}</div>
          <div class="details-row"><strong>เวลาที่แจ้งซ่อม:</strong> ${repairDate}</div>
          <div class="details-row"><strong>ชื่ออุปกรณ์:</strong> ${item.Equipments_name}</div>
          <div class="details-row"><strong>รายละเอียด:</strong> ${item.Damaged_details}</div>
          <div class="details-row"><strong>ห้อง:</strong> SC2-${item.Rooms_ID}</div>
          <div class="details-row"><strong>ผู้รับแจ้งซ่อม:</strong> ${item.Admin_Name}</div>
          <div class="details-row"><strong>สถานะ:</strong> ${item.Repair_status}</div>
      </div>
    `;
  console.log("📌 HTML ที่จะถูกแสดงใน Modal:", detailsContainer.innerHTML);
  document.getElementById("modalOverlay").style.display = "block";
  document.getElementById("detailsModal").style.display = "block";
}
window.onload = function () {
  fetchBrokenEquipments();
};
