const mysql = require("mysql2");
const fs = require("fs");
require("dotenv").config(); // โหลดค่าจาก .env

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DBNAME,
  port: process.env.DB_PORT,
  ssl: {
    ca: fs.readFileSync(process.env.DB_CA_CERT_PATH).toString(),
    require: true, // บังคับใช้ SSL/TLS (ค่า default ใน Aiven มักจะตั้งให้เป็น require)
    rejectUnauthorized: true, // ค่า default คือ true, บังคับตรวจสอบใบรับรอง
  },
});

// ตรวจสอบการเชื่อมต่อ
connection.connect((err) => {
  if (err) {
    console.error("❌ ไม่สามารถเชื่อมต่อกับฐานข้อมูล:", err);
    return;
  }
  console.log("✅ เชื่อมต่อฐานข้อมูลสำเร็จ!");
});

module.exports = connection;
