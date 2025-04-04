const API_URL = window.CONFIG.API_URL;
// ประกาศตัวแปรรวมสำหรับใช้ในทุกหน้า
let currentUser = null; // เก็บข้อมูลผู้ใช้ปัจจุบัน

// ฟังก์ชันตรวจสอบสถานะล็อกอิน
async function checkAuth() {
  try {
    console.log("[FROM auth.js] 🔄 กำลังตรวจสอบสถานะการล็อกอิน... ");
    const response = await fetch(`${API_URL}/auth/session`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      console.error(
        "[FROM auth.js] ❌ ไม่พบข้อมูลการล็อกอิน (status code: " +
          response.status +
          ")"
      );
      redirectToLogin();
      return null;
    }

    const userData = await response.json();
    currentUser = userData; // เก็บข้อมูลผู้ใช้ไว้ในตัวแปรรวม

    console.log("[FROM auth.js] ✅ ข้อมูลผู้ใช้:", userData);
    return userData;
  } catch (error) {
    console.error(
      "[FROM auth.js] ❌ เกิดข้อผิดพลาดในการตรวจสอบการล็อกอิน:",
      error
    );
    redirectToLogin();
    return null;
  }
}

// ฟังก์ชันออกจากระบบ
async function logout() {
  try {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    if (response.ok) {
      alert("ออกจากระบบสำเร็จ");
      redirectToLogin();
    } else {
      alert("เกิดข้อผิดพลาดในการออกจากระบบ");
    }
  } catch (error) {
    console.error("[FROM auth.js] ❌ ไม่สามารถออกจากระบบได้:", error);
    alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
  }
}

// ฟังก์ชันเปลี่ยนหน้าไปหน้าล็อกอิน
function redirectToLogin() {
  window.location.href = "../index.html";
}

// ฟังก์ชันแสดงข้อมูลผู้ใช้
function displayUserInfo() {
  if (!currentUser) return;

  const userNameElement = document.getElementById("user-name");
  if (userNameElement) {
    userNameElement.textContent = currentUser.data.full_name || "ไม่ระบุชื่อ";
  }
}

// ฟังก์ชันส่งผู้ใช้ไปยังหน้าหลักตาม role
function redirectToHome() {
  if (!currentUser) return;

  const role = currentUser.role;
  if (role === "นิสิต") {
    window.location.href = "../booker/home.html";
  } else if (role === "อาจารย์") {
    window.location.href = "../booker/home.html";
  } else if (role === "ผู้ดูแลห้อง") {
    window.location.href = "../admin/index.html";
  } else if (role === "ผู้บริหาร") {
    window.location.href = "../executive/dashboard.html";
  }
}

// บันทึกฟังก์ชันไว้ในตัวแปร global สำหรับเรียกใช้จากไฟล์อื่น
window.auth = {
  checkAuth,
  logout,
  redirectToLogin,
  displayUserInfo,
  redirectToHome,
  currentUser,
};

const isLoginPage = window.location.pathname.includes("index.html");
if (!isLoginPage) {
  checkAuth().then(() => {
    displayUserInfo();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const logoutButtons = document.querySelectorAll(".logout-btn, #logout-btn");
  logoutButtons.forEach((btn) => {
    btn.addEventListener("click", logout);
  });
});
