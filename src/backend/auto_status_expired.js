const connection = require("./core/db"); // <-- path เปลี่ยนตามจริง

exports.autoExpireRequests = async () => {
  try {
    const now = new Date();
    const formattedNow = now.toISOString().slice(0, 19).replace("T", " "); // MySQL format

    const sql = `
      UPDATE room_request
      SET request_status = 'คำขอหมดอายุ'
      WHERE request_status IN ('รอดำเนินการ', 'รออนุมัติ')
        AND TIMESTAMP(used_date, end_time) < ?
    `;

    connection.query(sql, [formattedNow], (err, result) => {
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
