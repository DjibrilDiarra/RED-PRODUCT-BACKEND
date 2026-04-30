const express = require('express')
const router = express.Router()

const ctrl = require('../controller/ctrl')
const hotelCtrl = require('../controller/hotelCtrl')

const multer = require('multer')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname)
    }
})

const upload = multer({ storage })

// AUTH
router.post('/inscription', ctrl.inscription)
router.post('/connexion', ctrl.connexion)

router.post('/mot-de-passe-oublie', ctrl.motDePasseOublie) // 
router.post('/reset-mot-de-passe', ctrl.resetMotDePasse)

// HOTELS
router.post('/hotel', upload.single('photo'), hotelCtrl.creerHotel)
router.get('/hotels', hotelCtrl.listerHotels)
router.get('/hotel/:id', hotelCtrl.getHotel)
router.delete('/hotel/:id', hotelCtrl.supprimerHotel)

module.exports = router