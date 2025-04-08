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

async function fetchUserInfo() {
  try {
    const response = await fetch(`${API_URL}/auth/session`, {
      method: "GET",
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Session expired");
    }
    const userSession = await response.json();
    console.log("🔍 ข้อมูลที่ได้รับจากเซิร์ฟเวอร์:", userSession);
    if (!userSession.data) {
      alert("กรุณาเข้าสู่ระบบใหม่");
      window.location.href = "../../index.html";
      return;
    }
    document.getElementById("student-name").textContent =
      userSession.data.full_name;
    document.getElementById("student-id").textContent =
      userSession.data.user_id;
    if (userSession.role === "นิสิต") {
      document.getElementById("stud-year").textContent =
        userSession.data.study_year || "-";
      document.getElementById("faculty").textContent =
        userSession.data.faculty || "-";
      document.getElementById("department").textContent =
        userSession.data.department || "-";
    } else {
      document.getElementById("stud-year").parentElement.style.display = "none";
      document.getElementById("faculty").textContent =
        userSession.data.faculty || "-";
      document.getElementById("department").textContent =
        userSession.data.department || "-";
    }
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการโหลดข้อมูล:", error);
    alert("เกิดข้อผิดพลาด กรุณาเข้าสู่ระบบใหม่");
    window.location.href = "../../index.html";
  }
}

function convertToThaiTime(utcDate) {
  if (!utcDate) return "-";
  const date = new Date(utcDate);
  date.setHours(date.getHours() + 7);
  return date.toISOString().slice(0, 10);
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
    confirmButtonText: "ตกลง",
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

      // ปรับสีของสถานะตามค่าของ repair_status
      let statusColor = "black"; // สีเริ่มต้น
      if (item.repair_status === "รอซ่อม") {
        statusColor = "#FFBF00"; // สีสำหรับสถานะรอซ่อม
      } else if (item.repair_status === "รับเรื่องแล้ว") {
        statusColor = "green"; // สีสำหรับสถานะรับเรื่องแล้ว
      } else if (item.repair_status === "กำลังจัดซื้อ") {
        statusColor = "orange"; // สีสำหรับสถานะกำลังจัดซื้อ
      } else if (item.repair_status === "กำลังซ่อม") {
        statusColor = "orange"; // สีสำหรับสถานะกำลังซ่อม
      } else if (item.repair_status === "ซ่อมสำเร็จ") {
        statusColor = "green"; // สีสำหรับสถานะซ่อมสำเร็จ
      } else if (item.repair_status === "ไม่สามารถซ่อมได้") {
        statusColor = "red"; // สีสำหรับสถานะไม่สามารถซ่อมได้
      }

      row.innerHTML = `
        <td>${new Date(item.repair_date).toLocaleString("th-TH")}</td>
        <td>${item.equipment_name || "-"}</td>
        <td>${item.damage_details || "-"}</td>
        <td>SC2-${item.room_id || "-"}</td>
        <td>${item.Admin_Name || "-"}</td>
        <td class="status" style="color: ${statusColor}; font-weight: bold;">${
        item.repair_status || "-"
      }</td>
        <td>
            <button class="repair-detail-btn" onclick="showDetails(${index}, 'repair')">รายละเอียด</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
    window.brokenEquipmentsData = brokenEquipments;
    console.log("✅ ตารางอัปเดตเรียบร้อย!");
    setupReportTable(4, 5); // เรียกฟังก์ชันที่ใช้สำหรับการแสดงเพิ่มเติมในตาราง
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการโหลดข้อมูล:", error);
  }
}

// เพิ่มฟังก์ชันแสดงรูปภาพขนาดใหญ่ (อาจเรียกใช้เมื่อคลิกที่รูปในรายละเอียด)
function showLargeImage(imageUrl) {
  if (!imageUrl) return;

  Swal.fire({
    imageUrl: imageUrl,
    imageAlt: "รูปอุปกรณ์ชำรุด",
    width: 800,
    showConfirmButton: false,
    showCloseButton: true,
    customClass: {
      image: "large-equipment-image",
    },
  });
}

function showDetails(index, type) {
  if (type === "repair") {
    const item = window.brokenEquipmentsData[index];
    console.log("📌 ข้อมูลที่ดึงมา:", item);

    // กำหนด URL ของรูปภาพ
    let imageUrl = "";
    if (item.image_path) {
      // ใช้ฟังก์ชัน fetch แทนการโหลดภาพโดยตรง
      fetch(`${API_URL}/booker/image/${item.image_path}`)
        .then((response) => response.blob())
        .then((blob) => {
          const objectUrl = URL.createObjectURL(blob);

          // สร้าง HTML สำหรับ SweetAlert2 พร้อมรูปภาพ
          createAndShowDetailPopup(item, objectUrl);
        })
        .catch((error) => {
          console.error("ไม่สามารถโหลดรูปภาพได้:", error);
          // แสดง popup โดยไม่มีรูปภาพ
          createAndShowDetailPopup(item, null);
        });
    } else {
      // กรณีไม่มีรูปภาพ
      createAndShowDetailPopup(item, null);
    }
  }
}

// ฟังก์ชันสำหรับสร้างและแสดง popup รายละเอียด
function createAndShowDetailPopup(item, imageUrl) {
  // กำหนดสีของสถานะซ่อม
  let statusColor = "black";
  if (item.repair_status === "รอซ่อม") {
    statusColor = "#FFBF00";
  } else if (item.repair_status === "รับเรื่องแล้ว") {
    statusColor = "green";
  } else if (
    item.repair_status === "กำลังจัดซื้อ" ||
    item.repair_status === "กำลังซ่อม"
  ) {
    statusColor = "orange";
  } else if (item.repair_status === "ซ่อมสำเร็จ") {
    statusColor = "green";
  } else if (item.repair_status === "ไม่สามารถซ่อมได้") {
    statusColor = "red";
  }

  // สร้าง HTML สำหรับแสดงรายละเอียด
  let htmlContent = `
    <div class="repair-details-container">
      ${
        imageUrl
          ? `<div class="image-container">
              <img src="${imageUrl}" alt="รูปอุปกรณ์ชำรุด" class="repair-image">
              <div class="image-caption">รูปภาพอุปกรณ์ที่ชำรุด</div>
            </div>`
          : `<div class="no-image-container">
              <div class="no-image-text">ไม่มีรูปภาพ</div>
            </div>`
      }
      
      <div class="details-section">
        <div class="detail-row">
          <div class="detail-label">🖥 ชื่ออุปกรณ์:</div>
          <div class="detail-value">${item.equipment_name || "-"}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">🔍 สาเหตุ:</div>
          <div class="detail-value">${item.damage || "-"}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">🔍 สาเหตุเพิ่มเติม:</div>
          <div class="detail-value">${item.damage_details || "-"}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">📍 ห้อง:</div>
          <div class="detail-value">SC2-${item.room_id || "-"}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">⚠️ สถานะ:</div>
          <div class="detail-value" style="color: ${statusColor}; font-weight: bold;">${
    item.repair_status || "-"
  }</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">👤 ผู้รับแจ้งซ่อม:</div>
          <div class="detail-value">${
            item.Admin_Name || "รอผู้รับแจ้งซ่อม"
          }</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">📅 วันที่แจ้งซ่อม:</div>
          <div class="detail-value">${new Date(item.repair_date).toLocaleString(
            "th-TH"
          )}</div>
        </div>
      </div>
    </div>
  `;

  // แสดง SweetAlert2 แบบปรับแต่ง
  Swal.fire({
    title: "รายละเอียดการแจ้งซ่อม",
    html: htmlContent,
    width: 800,
    confirmButtonText: "ปิด",
    customClass: {
      popup: "my-swal-popup repair-popup",
      confirmButton: "btn btn-secondary",
    },
    buttonsStyling: false,
    showCloseButton: true,
  });
}

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
          } else if (statusText === "คำขอหมดอายุ") {
            statusCell.style.color = "gray";
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

      // สร้างปุ่มตามสถานะ
      let actionButtons = "";

      // เพิ่มปุ่มดูรายละเอียด (รวมข้อมูลหมายเหตุไว้ในรายละเอียดแล้ว)
      const detailButton = `<button class="btn detail-btn btn-sm me-2" onclick="showBookingDetails(${booking.room_request_id})">รายละเอียด</button>`;

      // เพิ่มปุ่มยกเลิกสำหรับสถานะที่เหมาะสม
      if (
        booking.request_status === "รอดำเนินการ" ||
        booking.request_status === "รออนุมัติ"
      ) {
        actionButtons =
          detailButton +
          `<button class="btn cancel-btn btn-sm" onclick="cancelBooking(${booking.room_request_id})">ยกเลิกการจอง</button>`;
      } else {
        actionButtons = detailButton;
      }

      row.innerHTML = `
        <td>${booking.request_type || "-"}</td>
        <td>${booking.room_name || "-"}</td>
        <td>${formatDate(booking.Submitted_date) || "-"}</td>
        <td>${formatDate(booking.Used_date) || "-"}</td>
        <td>${booking.start_time || "-"}</td>
        <td>${booking.end_time || "-"}</td>
        <td class="status">${booking.request_status || "-"}</td>
        <td>${actionButtons}</td>
      `;
      tableBody.appendChild(row);
    });
    setupBookingTable(4, 5);
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาด:", error);
    document.getElementById(
      "booking-table-body"
    ).innerHTML = `<tr><td colspan="8" style="text-align: center; color: red;">เกิดข้อผิดพลาดในการโหลดข้อมูล</td></tr>`;
  }
}

// ฟังก์ชันแสดงรายละเอียดการจอง
// ฟังก์ชันแสดงรายละเอียดการจอง
async function showBookingDetails(requestID) {
  try {
    // ดึงข้อมูลจาก API
    const res = await fetch(`${API_URL}/booker/detailsPop`);
    if (!res.ok) throw new Error("ไม่สามารถดึงข้อมูลได้");

    const data = await res.json();
    const booking = data.find((item) => item.requestID === requestID);

    if (!booking) {
      Swal.fire({
        icon: "error",
        title: "ไม่พบข้อมูลการจอง",
        confirmButtonText: "ตกลง",
        customClass: {
          popup: "my-swal-popup",
        },
      });
      return;
    }

    // ดึงรายละเอียดการจอง
    const bookingRoomDetails = booking.detailbookingreason?.trim()
      ? booking.detailbookingreason
      : "ไม่มีข้อมูล";

    // ดึงข้อมูลหมายเหตุ (จากปุ่มหมายเหตุเดิม)
    const bookingData =
      window.loadedBookingData?.find((b) => b.room_request_id === requestID) ||
      {};
    const status = bookingData.request_status || "-";
    const utcDate = new Date(booking.datebooking);
    const thaiTimeBooking = utcDate
      .toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
      })
      .split(" ")[0];

    // สร้าง HTML สำหรับ SweetAlert2
    let htmlContent = `
      <div class="text-start">
        <p><strong>📍 ห้องที่จอง:</strong> ${booking.roombooking}</p>
        <p><strong>🕒 วันที่ใช้ห้อง:</strong> ${`${thaiTimeBooking}, ${booking.timebooking}`}</p>
        <p><strong>📊 สถานะ:</strong> <span style="color: ${getStatusColor(
          status
        )};">${status}</span></p>
    `;

    // เพิ่มส่วนข้อมูลผู้อนุมัติ (ถ้ามี)
    if (bookingData.admin_name || bookingData.executive_name) {
      htmlContent += `<p><strong>👤 ผู้อนุมัติ:</strong> ${
        bookingData.admin_name || bookingData.executive_name
      }</p>`;
    } else {
      htmlContent += `<p><strong>👤 ผู้อนุมัติ:</strong> <i>รอการอนุมัติ</i></p>`;
    }

    // เพิ่มเหตุผลที่ไม่อนุมัติ (ถ้ามี)
    if (status === "ไม่อนุมัติ" && bookingData.reject_reason) {
      htmlContent += `
        <p><strong>❌ เหตุผลที่ไม่อนุมัติ:</strong> ${
          bookingData.reject_reason || "-"
        }</p>
        <p><strong>📝 รายละเอียดเพิ่มเติม:</strong> ${
          bookingData.detail_reject_reason || "-"
        }</p>
      `;
    }

    htmlContent += `
        <hr/>
        <h6 class="fw-bold">ข้อมูลผู้จอง</h6>
        <p><strong>รหัสนิสิต / อาจารย์:</strong> ${booking.id}</p>
        <p><strong>ชื่อ-นามสกุล:</strong> ${booking.name}</p>
        <p><strong>Email:</strong> ${booking.email}</p>
        <p><strong>เบอร์ติดต่อ:</strong> ${booking.phone_number}</p>
        <p><strong>สาขาวิชา:</strong> ${booking.department}</p>
        <hr/>
        <h6 class="fw-bold">ข้อมูลผู้จองร่วม</h6>
    `;

    // กรองผู้ใช้ห้องร่วม
    const participants = data.filter(
      (item) => item.requestID === requestID && item.role !== "ผู้ขอใช้"
    );

    if (participants.length > 0) {
      htmlContent += `
        <div class="table-responsive">
          <table class="table table-bordered table-sm" style="font-size: 14px;">
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

      participants.forEach((p, i) => {
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
      htmlContent += "<p>ไม่มีผู้จองร่วม</p>";
    }

    htmlContent += `
      <hr/>
      <p><strong>วัตถุประสงค์:</strong> ${booking.bookingreason}</p>
      <p><strong>รายละเอียดเพิ่มเติม:</strong> ${bookingRoomDetails}</p>
      </div>
    `;

    // แสดง SweetAlert2 แบบปรับแต่ง
    Swal.fire({
      title: "รายละเอียดการจองห้อง",
      html: htmlContent,
      width: 700,
      confirmButtonText: "ปิด",
      customClass: {
        popup: "my-swal-popup",
        confirmButton: "btn btn-secondary",
      },
      buttonsStyling: false,
      showCloseButton: true,
      heightAuto: false,
      backdrop: true,
    });
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการโหลดข้อมูล:", error);
    Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาด",
      text: "ไม่สามารถโหลดข้อมูลรายละเอียดได้",
      confirmButtonText: "ตกลง",
    });
  }
}

// ฟังก์ชันช่วยสำหรับกำหนดสีของสถานะ
function getStatusColor(statusText) {
  statusText = statusText.trim();
  if (statusText === "อนุมัติ") {
    return "green";
  } else if (statusText === "คำขอหมดอายุ") {
    return "gray";
  } else if (statusText === "ไม่อนุมัติ" || statusText === "ยกเลิกการจอง") {
    return "red";
  } else if (statusText === "รออนุมัติ" || statusText === "รอดำเนินการ") {
    return "orange";
  }
  return "black";
}

// เพิ่มการมองเห็นในแต่ละแถวของตาราง รายละเอียดการจอง
function setupBookingTable(initialVisible, increment) {
  let visibleRows = initialVisible;

  const loadMoreBtn = document.getElementById("load-more-btn-booking");
  const tableRows = document.querySelectorAll("#booking-table-body tr");

  function updateTable() {
    tableRows.forEach((row, index) => {
      row.style.display = index < visibleRows ? "table-row" : "none";
    });

    loadMoreBtn.style.display =
      visibleRows >= tableRows.length ? "none" : "block";
  }

  loadMoreBtn.addEventListener("click", function () {
    visibleRows += increment;
    updateTable();
  });

  updateTable(); // แสดงรอบแรก
}

// เพิ่มการมองเห็นในแต่ละแถวของตาราง รายละเอียดการรายงานอุปกรณ์
function setupReportTable(initialVisible, increment) {
  let visibleRows = initialVisible;

  const loadMoreBtn = document.getElementById("load-more-btn-report");
  const tableRows = document.querySelectorAll("#repair-table-body tr");

  function updateTable() {
    tableRows.forEach((row, index) => {
      row.style.display = index < visibleRows ? "table-row" : "none";
    });

    loadMoreBtn.style.display =
      visibleRows >= tableRows.length ? "none" : "block";
  }

  loadMoreBtn.addEventListener("click", function () {
    visibleRows += increment;
    updateTable();
  });

  updateTable(); // แสดงรอบแรก
}

document.addEventListener("DOMContentLoaded", function () {
  fetchUserBookingData();
  fetchUserInfo();
  fetchBrokenEquipments();

  // เพิ่ม event listener หลังจากโหลดข้อมูลเสร็จ
  document.addEventListener("click", function (event) {
    // ตรวจสอบว่าคลิกที่รูปภาพในตารางหรือไม่
    if (event.target.classList.contains("image-preview")) {
      // หา index จากแถวที่คลิก
      const row = event.target.closest("tr");
      const index = Array.from(row.parentNode.children).indexOf(row);
      // แสดงรายละเอียด
      showDetails(index, "repair");
    }
  });
  const style = document.createElement("style");
  style.textContent = `
    .large-equipment-image {
      max-width: 100%;
      max-height: 80vh;
      object-fit: contain;
    }
  `;
  document.head.appendChild(style);
});
