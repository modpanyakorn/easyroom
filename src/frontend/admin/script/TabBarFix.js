document.addEventListener("DOMContentLoaded", function () {
    // ตรวจสอบ URL ของหน้า
    const currentPage = window.location.pathname;

    // ค้นหา tab ทั้งหมด
    const tabs = document.querySelectorAll(".tab");

    // กำหนดค่า path ให้ตรงกับแต่ละแท็บ
    tabs.forEach(tab => {
        const link = tab.querySelector("a");
        if (link && currentPage.includes(link.getAttribute("href"))) {
            tab.classList.add("active"); // เพิ่ม active ถ้า URL ตรงกัน
        } else {
            tab.classList.remove("active"); // เอา active ออกจากแท็บอื่น
        }
    });
});
