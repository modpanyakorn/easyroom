const express = require("express");
const router = express.Router();
const controller = require("./booker.controller");

router.get("/userBookings/:userId", controller.getUserBookings);
router.delete("/cancelBooking/:requestId", controller.cancelBooking);
router.get("/getBrokenEquipments", controller.getBrokenEquipments);
router.get("/image/:filename", controller.getBrokenEquipmentsImage);
router.get("/roomdetail", controller.getRoomDetail);
router.get("/rooms", controller.getRooms);
router.post(
  "/uploadReportImage",
  controller.upload.single("image"), // << สำคัญมาก!
  controller.uploadReportImage
);
router.post("/reportIssue", controller.reportIssue);
router.get("/getRoomId", controller.getRoomId);
router.get("/getComputersByRoom", controller.getComputersByRoom);
router.get("/getEquipmentId", controller.getEquipmentId);
router.get("/getLatestRepairNumber", controller.getRepairNumber);
// เพิ่มได้เรื่อย ๆ
// ✅ ใส่ multer middleware ให้ route นี้!

module.exports = router;
