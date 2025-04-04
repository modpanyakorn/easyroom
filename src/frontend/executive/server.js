const express = require('express');
const mysql = require('mysql');
const path = require('path');
const app = express();

// การเชื่อมต่อฐานข้อมูล
const connection = mysql.createConnection({
    host: 'localhost', // หรือ IP ของฐานข้อมูล
    user: 'root', // ชื่อผู้ใช้ฐานข้อมูล
    password: '', // รหัสผ่าน
    database: 'easyroom-pre' // ชื่อฐานข้อมูล
});

// เชื่อมต่อกับฐานข้อมูล
connection.connect(err => {
    if (err) {
        console.error('Error connecting to the database: ' + err.stack);
        return;
    }
    console.log('Connected to the database');
});

// ดึงข้อมูลอุปกรณ์ที่เสีย
app.get('/data', (req, res) => {
    connection.query("SELECT * FROM `Equipments_list_brokened`", (err, results) => {
        if (err) throw err;
        res.json(results); // ส่งผลลัพธ์เป็น JSON
    });
});

// เสิร์ฟไฟล์ HTML
app.use(express.static(path.join(__dirname, 'src/frontend/executive/alldata')));


app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
