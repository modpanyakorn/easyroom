const express = require("express");
const router = express.Router();
const controller = require("./admin.controller");

// router.post("/bookRoom", controller.bookRoom);
router.get("/getSchedule", controller.getSchedule);
router.get('/data/:table', controller.getDataFromTable);
router.post('/updateStatus', controller.updateStatus);
router.post('/insertSchedule', controller.insertSchedule);
router.post('/deleteSchedule', controller.deleteSchedule);
router.get('/data/room_schedule', controller.get_room_schedule);
router.post('/updateEquipmentStatus', controller.updateEquipmentStatus);
router.get('/image/:filename', controller.getFileName);
router.post('/updateComputerStatus', controller.updateComputerStatus);
router.post('/updateEquipmentStock', controller.updateEquipmentStock);
router.post('/updateRoomStatus', controller.updateRoomStatus);
router.get('/getEquipments', controller.getEquipments);
router.post('/updateScheduleStatus', controller.updateScheduleStatus);

module.exports = router;