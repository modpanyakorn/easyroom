const express = require("express");
const connection = require("./db"); // นำเข้าการเชื่อมต่อฐานข้อมูล
const mysql = require("mysql2");
const fs = require("fs");
const cors = require("cors"); // เพิ่ม cors
const { error } = require("console");
const util = require("util");
const path = require("path");

exports.getEquipment_brokened = (req, res) => {
    connection.query("SELECT * FROM equipment_brokened", (err, results) => {
      if (err) {
        console.error("❌ Error:", err);
        res.status(500).send(err);
        return;
      }
      console.log("✅ ดึงข้อมูลสำเร็จจาก equipment_brokened:", results);
      res.json(results);
    });
  };