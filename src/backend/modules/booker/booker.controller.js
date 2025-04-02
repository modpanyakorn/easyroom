const connection = require("../../core/db");
const path = require("path");
const fs = require("fs");

exports.getUserBookings = async (req, res) => {
  const { userId } = req.params;
  console.log("🎯 userId ที่รับมา:", userId);

  try {
    await connection.promise().query("SET time_zone = '+07:00'");

    // ตรวจสอบ role ของ user
    const [userResults] = await connection
      .promise()
      .query("SELECT role FROM user WHERE username = ?", [userId]);

    if (userResults.length === 0) {
      return res.status(404).json({ error: "ไม่พบผู้ใช้ในระบบ" });
    }

    const userRole = userResults[0].role;
    console.log(`👤 ผู้ใช้ ${userId} มีบทบาทเป็น: ${userRole}`);

    let query = "";
    let values = [];

    if (userRole === "นิสิต") {
      query = `
        SELECT 
          rlr.room_request_id, 
          rlr.room_id, 
          rli.room_name,  
          CONVERT_TZ(rlr.submitted_time, '+00:00', '+07:00') AS Submitted_date, 
          CONVERT_TZ(rlr.used_date, '+00:00', '+07:00') AS Used_date, 
          rlr.start_time, 
          rlr.end_time, 
          rlr.request_status, 
          rlr.request_type,
          rlr.reject_reason,
          rlr.detail_reject_reason,
          ad.full_name AS admin_name,
          ex.full_name AS executive_name

        FROM room_request rlr
        JOIN room rli ON rlr.room_id = rli.room_id
        JOIN room_type rt ON rt.room_type_id = rli.room_type_id
        JOIN student s ON rlr.student_id = s.student_id
        LEFT JOIN admin ad ON rlr.admin_id = ad.admin_id
        LEFT JOIN executive ex ON rlr.executive_id = ex.executive_id
        WHERE s.student_id = ?
      `;
      values = [userId];
    } else if (userRole === "อาจารย์") {
      query = `
        SELECT 
          rlr.room_request_id, 
          rlr.room_id, 
          rli.room_name, 
          CONVERT_TZ(rlr.submitted_time, '+00:00', '+07:00') AS Submitted_date, 
          CONVERT_TZ(rlr.used_date, '+00:00', '+07:00') AS Used_date, 
          rlr.start_time, 
          rlr.end_time, 
          rlr.request_status, 
          rlr.request_type,
          rlr.reject_reason,
          rlr.detail_reject_reason,
          ad.full_name AS admin_name,
          ex.full_name AS executive_name

        FROM room_request rlr
        JOIN room rli ON rlr.room_id = rli.room_id
        JOIN room_type rt ON rt.room_type_id = rli.room_type_id
        JOIN teacher t ON rlr.teacher_id = t.teacher_id
        LEFT JOIN admin ad ON rlr.admin_id = ad.admin_id
        LEFT JOIN executive ex ON rlr.executive_id = ex.executive_id
        WHERE t.teacher_id = ?
      `;
      values = [userId];
    } else {
      return res.status(400).json({ error: "บทบาทไม่ถูกต้อง" });
    }

    const [results] = await connection.promise().query(query, values);
    console.log(`✅ ดึงข้อมูลการจองของ ${userId} สำเร็จ:`, results);

    res.json(results);
  } catch (err) {
    console.error("❌ เกิดข้อผิดพลาด:", err);
    res.status(500).json({ error: "ดึงข้อมูลล้มเหลว" });
  }
};

exports.cancelBooking = async (req, res) => {
  const { requestId } = req.params;
  console.log(`🛑 กำลังยกเลิกการจอง ID: ${requestId}`);

  try {
    if (!requestId) {
      console.log("❌ requestId ไม่ถูกต้อง");
      return res.status(400).json({ error: "requestId ไม่ถูกต้อง" });
    }

    // เช็คว่ามีการจองตาม requestId จริงหรือไม่
    const [checkResult] = await connection
      .promise()
      .query("SELECT * FROM room_request WHERE room_request_id = ?", [
        requestId,
      ]);
    console.log("🔍 ข้อมูลที่ค้นหา:", checkResult);

    if (checkResult.length === 0) {
      console.log("❌ ไม่พบข้อมูลการจองที่สามารถยกเลิกได้");
      return res.status(404).json({ error: "ไม่พบการจองนี้ในระบบ" });
    }

    // อัปเดตสถานะเป็น "ยกเลิกการจอง"
    const [updateResult] = await connection.promise().query(
      `
      UPDATE room_request
      SET request_status = 'ยกเลิกการจอง'
      WHERE room_request_id = ?
    `,
      [requestId]
    );

    console.log("🔄 อัปเดตสถานะ:", updateResult);

    if (updateResult.affectedRows === 0) {
      console.log("❌ ไม่สามารถอัปเดตสถานะการจองได้");
      return res.status(400).json({ error: "ไม่สามารถยกเลิกการจองได้" });
    }

    console.log(`✅ อัปเดตสถานะเป็น 'ยกเลิกการจอง' สำเร็จ! ID: ${requestId}`);
    res.json({ success: true, message: "ยกเลิกการจองสำเร็จ!" });
  } catch (err) {
    console.error("❌ ERROR:", err);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการยกเลิกการจอง" });
  }
};

exports.getBrokenEquipments = async (req, res) => {
  console.log("🔍 DEBUG: ตรวจสอบเซสชัน", req.session);

  if (!req.session.user || !req.session.user.data) {
    return res.status(401).json({ error: "กรุณาเข้าสู่ระบบ" });
  }

  const { role, data } = req.session.user;
  let userId = null;
  let query = "";
  let values = [];

  if (role === "นิสิต") {
    userId = data.student_id;
    console.log("🎯 ดึงข้อมูลแจ้งซ่อมของนิสิต student_id:", userId);

    query = `
          SELECT 
              DATE_FORMAT(eb.repair_date, '%Y-%m-%d %H:%i:%s') AS repair_date, 
              ei.equipment_name, 
              eb.damage_details, 
              eb.room_id, 
              CASE 
                  WHEN eb.admin_id IS NULL THEN 'รอผู้รับแจ้งซ่อม' 
                  ELSE ai.full_name 
              END AS Admin_Name, 
              eb.repair_status,
              eb.image_path,
              eb.repair_number,
              damage
          FROM equipment_brokened eb
          LEFT JOIN equipment ei ON eb.equipment_id = ei.equipment_id
          LEFT JOIN admin ai ON eb.admin_id = ai.admin_id
          WHERE eb.student_id = ?
          ORDER BY eb.repair_date DESC;
      `;
    values = [userId];
  } else if (role === "อาจารย์") {
    userId = data.teacher_id;
    console.log("🎯 ดึงข้อมูลแจ้งซ่อมของอาจารย์ teacher_id:", userId);

    query = `
          SELECT 
              DATE_FORMAT(eb.repair_date, '%Y-%m-%d %H:%i:%s') AS repair_date, 
              ei.equipment_name, 
              eb.damage_details, 
              eb.room_id, 
              CASE 
                  WHEN eb.admin_id IS NULL THEN 'รอผู้รับแจ้งซ่อม' 
                  ELSE ai.full_name 
              END AS Admin_Name, 
              eb.repair_status,
              eb.image_path,
              eb.repair_number,
              damage
          FROM equipment_brokened eb
          LEFT JOIN equipment ei ON eb.equipment_id = ei.equipment_id
          LEFT JOIN admin ai ON eb.admin_id = ai.admin_id
          WHERE eb.teacher_id = ?
          ORDER BY eb.repair_date DESC;
      `;
    values = [userId];
  } else {
    return res.status(400).json({ error: "บทบาทไม่ถูกต้อง" });
  }

  try {
    console.log("🚀 รัน SQL Query:", query);
    console.log("📌 ค่าที่ใช้ใน Query:", values);

    const [results] = await connection.promise().query(query, values);
    console.log("✅ ข้อมูลที่ดึงจากฐานข้อมูล:", results);

    res.json(results);
  } catch (err) {
    console.error("❌ เกิดข้อผิดพลาดในการดึงข้อมูล:", err);
    res.status(500).json({ error: "ดึงข้อมูลล้มเหลว" });
  }
};

exports.getBrokenEquipmentsImage = async (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(
    __dirname,
    "../../storage/equipment_img",
    filename
  );

  if (fs.existsSync(filePath)) {
    res.setHeader("Content-Type", "image/jpeg");
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: "File not found" });
  }
};

exports.getComputerManagement = async (req, res) => {
  connection.query("SELECT * FROM computer_management", (err, results) => {
    if (err) {
      console.error("❌ Error:", err);
      res.status(500).send(err);
      return;
    }
    console.log("✅ ดึงข้อมูลคอมพิวเตอร์สำเร็จ:", results.length);
    res.json(results);
  });
};

exports.getRoomDetail = async (req, res) => {
  const query = `
    SELECT
      rli.room_name AS full_name,
      rli.floor,
      rli.room_id,
      rli.room_name,
      rt.type_name AS room_type, --
      SUM(CASE WHEN rlr.request_status = 'อนุมัติ' THEN 1 ELSE 0 END) AS Approved_Count
    FROM room rli
    LEFT JOIN room_request rlr ON rli.room_id = rlr.room_id
    LEFT JOIN room_type rt ON rli.room_type_id = rt.room_type_id -- 
    GROUP BY rli.room_id, rli.room_name, rli.floor, rli.room_name
    ORDER BY Approved_Count DESC;
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("❌ เกิดข้อผิดพลาด:", err);

      res.status(500).send(err);

      return;
    }

    console.log("✅ ดึงข้อมูลห้องสำเร็จ:", results);

    res.json(results);
  });
};

exports.getRooms = async (req, res) => {
  try {
    const [results] = await connection
      .promise()
      .query("SELECT room_id, room_name, room_status FROM room");
    res.json(results);
  } catch (err) {
    console.error("❌ เกิดข้อผิดพลาดในการดึงข้อมูลห้อง:", err);
    res.status(500).json({ error: "ไม่สามารถดึงข้อมูลห้องได้" });
  }
};
