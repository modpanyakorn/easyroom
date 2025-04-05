const connection = require("./core/db"); // <-- path เปลี่ยนตามจริง

exports.autoExpireRequests = async () => {
  try {
    const now = new Date();

    // ถ้าอยากให้ใช้เวลาของ Time Zone Bangkok (Asia/Bangkok)
    const options = { timeZone: "Asia/Bangkok", hour12: false };
    const formattedNow = new Intl.DateTimeFormat("en-GB", options).format(now);
    
    // แปลงเป็น MySQL format (YYYY-MM-DD HH:mm:ss)
    const mysqlFormattedNow = formattedNow.replace(", ", " "); 

    const sql = `
      UPDATE room_request
      SET request_status = 'คำขอหมดอายุ'
      WHERE request_status IN ('รอดำเนินการ', 'รออนุมัติ')
        AND TIMESTAMP(used_date, end_time) <= CONVERT_TZ(NOW(), 'UTC', 'Asia/Bangkok');
    `;

    connection.query(sql, [mysqlFormattedNow], (err, result) => {
      if (err) {
        console.error("❌ Query error:", err);
        return;
      }
      console.log(`🕒 คำขอที่หมดอายุอัปเดตแล้ว: ${result.affectedRows} รายการ`);
    });

  } catch (error) {
    console.error("❌ Error in autoExpireRequests:", error);
  }
};
