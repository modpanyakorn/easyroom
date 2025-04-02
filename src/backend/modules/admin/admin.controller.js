const connection = require("../../core/db");

// exports.bookRoom = async (req, res) => {
//   // ดึง user จาก session
//   const { role, data } = req.session.user || {};
//   if (!role || !data) return res.status(401).json({ error: "ไม่ได้ล็อกอิน" });

//   const { room_id, used_date, start_time, end_time, request_reason } = req.body;
//   // บันทึกลง DB ตาม role ได้เลย
// };

// exports.getSchedule = async (req, res) => {
//   const [rows] = await connection
//     .promise()
//     .query("SELECT * FROM room_schedule");
//   res.json(rows);
// };

exports.getSchedule = async (req, res) => {
  try {
    const [results] = await connection
      .promise()
      .query("SELECT * FROM room_schedule");
    console.log("✅ ดึงข้อมูลตารางเรียนสำเร็จ:", results.length);
    res.json(results);
  } catch (err) {
    console.error("❌ เกิดข้อผิดพลาดในการดึงตารางเรียน:", err);
    res.status(500).json({ error: "ดึงข้อมูลตารางเรียนล้มเหลว" });
  }
};
