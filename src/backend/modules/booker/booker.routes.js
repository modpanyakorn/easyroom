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
router.get("/getSchedule", controller.getSchedule);
router.get("/room_request", controller.getRoomRequest);
router.get("/computer_management", controller.getComputerManagement);
router.get("/getEquipments", controller.getEquipments);
router.get("/getEquipmentInformation", controller.getEquipmentInformation);
router.post("/submitBookingIntime", controller.submitBookingIntime);
router.get("/getBrokenEquipments", controller.getBrokenEquipments);
router.get("/data/student", controller.getStudent);
router.post("/submitBookingOuttime", controller.submitBookingOuttime);
router.post(
  "/submitBookingIntimeTeacher",
  controller.submitBookingIntimeTeacher
);
router.post(
  "/submitBookingOuttimeTeacher",
  controller.submitBookingOuttimeTeacher
);
router.get("/detailsPop", controller.detailsPop);
// เพิ่มได้เรื่อย ๆ
// ✅ ใส่ multer middleware ให้ route นี้!

module.exports = router;
