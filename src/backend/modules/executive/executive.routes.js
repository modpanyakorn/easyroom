const express = require("express");
const router = express.Router();
const controller = require("./executive.controller");


    router.get("/equipment_brokenedd", controller.getEquipment_brokened);