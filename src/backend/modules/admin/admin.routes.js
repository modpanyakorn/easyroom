const express = require("express");
const router = express.Router();
const controller = require("./admin.controller");

// router.post("/bookRoom", controller.bookRoom);
router.get("/getSchedule", controller.getSchedule);
// เพิ่มได้เรื่อย ๆ

module.exports = router;
