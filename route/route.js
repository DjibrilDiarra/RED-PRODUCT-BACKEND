const express = require("express")
const router = express.Router()

const ctrl = require("../controller/ctrl")
const hotelCtrl = require("../controller/hotelCtrl")
const upload = require("../middleware/upload")

// AUTH
router.post("/inscription", ctrl.inscription)
router.post("/connexion", ctrl.connexion)

// HOTEL
router.post("/hotel", upload.single("photo"), hotelCtrl.creerHotel)

router.get("/hotels", hotelCtrl.listerHotels)

router.get("/hotel/:id", hotelCtrl.getHotel)

router.delete("/hotel/:id", hotelCtrl.supprimerHotel)

module.exports = router