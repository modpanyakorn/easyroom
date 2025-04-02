// 📁 src/backend/core/auth/auth.controller.js
const connection = require("../db");

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    // 1) เช็ค user table ก่อน
    const [users] = await connection
      .promise()
      .query("SELECT * FROM user WHERE username = ? AND password = ?", [
        username,
        password,
      ]);

    if (users.length === 0) {
      return res
        .status(401)
        .json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
    }

    const user = users[0];

    // 2) สร้างตัวแปรมาเก็บว่าเป็น role อะไร
    let role = null;
    let data = null;

    // (ก) เช็คว่ามีในตาราง student ไหม
    const [studentResults] = await connection
      .promise()
      .query("SELECT * FROM student WHERE student_id = ?", [user.username]);
    if (studentResults.length > 0) {
      role = "นิสิต";
      data = studentResults[0];
    }

    // (ข) เช็คว่าเป็น teacher ไหม
    const [teacherResults] = await connection
      .promise()
      .query("SELECT * FROM teacher WHERE teacher_id = ?", [user.username]);
    if (teacherResults.length > 0) {
      role = "อาจารย์";
      data = teacherResults[0];
    }

    // (ค) เช็คว่าเป็น admin ไหม
    const [adminResults] = await connection
      .promise()
      .query("SELECT * FROM admin WHERE admin_id = ?", [user.username]);
    if (adminResults.length > 0) {
      role = "ผู้ดูแลห้อง";
      data = adminResults[0];
    }

    // (ง) เช็คว่าเป็น executive ไหม
    const [execResults] = await connection
      .promise()
      .query("SELECT * FROM executive WHERE executive_id = ?", [user.username]);
    if (execResults.length > 0) {
      role = "ผู้บริหาร";
      data = execResults[0];
    }

    // 3) ถ้าไม่มี role อะไรเลย => ไม่มีข้อมูล
    if (!role || !data) {
      return res.status(404).json({ error: "ไม่พบข้อมูลผู้ใช้ในระบบ role" });
    }

    // 4) เก็บข้อมูลลง session
    req.session.user = { role, data };
    req.session.save((err) => {
      if (err) {
        console.error("❌ เกิดข้อผิดพลาดในการบันทึกเซสชัน:", err);
        return res.status(500).json({ error: "บันทึกเซสชันล้มเหลว" });
      }

      // 5) ส่ง cookie และบอก role กลับไป
      res.cookie("connect.sid", req.sessionID, {
        httpOnly: true,
        sameSite: "lax",
      });
      return res.json({ success: true, role });
    });
  } catch (err) {
    console.error("❌ เกิดข้อผิดพลาด:", err);
    res.status(500).json({ error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
};

exports.session = async (req, res) => {
  console.log("📌 ตรวจสอบเซสชันจาก API:", req.session);

  if (!req.session.user) {
    return res.status(401).json({ error: "ไม่ได้ล็อกอิน" });
  }

  const { role, data } = req.session.user;
  // หาว่ามี student_id, teacher_id, admin_id, executive_id
  let userId =
    data.student_id ||
    data.teacher_id ||
    data.admin_id ||
    data.executive_id ||
    null;

  if (!userId) {
    return res.status(401).json({ error: "ไม่พบข้อมูลผู้ใช้" });
  }

  // ข้อมูลที่จะส่งกลับไป
  res.json({
    role,
    data: {
      user_id: userId,
      full_name: data.full_name,
      faculty: data.faculty || null,
      department: data.department || null,
      phone_number: data.phone_number || null,
      study_year: data.study_year || null, // ตัวอย่าง
    },
  });
};

exports.logout = async (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
};
