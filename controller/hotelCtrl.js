const fs = require('fs')
const Hotel = require('../models/Hotel')

//  CREER HOTEL
exports.creerHotel = async (req, res) => {
    try {
        console.log("BODY:", req.body)
        console.log("FILE:", req.file)

        const hotel = new Hotel({
            nom: req.body.nom,
            adresse: req.body.adresse,
            prix: req.body.prix,
            image: req.file
            ? `${process.env.BASE_URL}/uploads/${req.file.filename}`
            : null
        })

        await hotel.save()

        res.json(hotel)
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: err.message })
    }
}


// LISTER HOTELS
exports.listerHotels = async (req, res) => {
    try {
        const hotels = await Hotel.find()
        res.json(hotels)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}


//  GET 1 HOTEL
exports.getHotel = async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.id)

        if (!hotel) {
            return res.status(404).json({ message: "Hôtel introuvable" })
        }

        res.json(hotel)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}


// SUPPRIMER HOTEL
exports.supprimerHotel = async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.id)

        if (!hotel) {
            return res.status(404).json({ message: "Hôtel introuvable" })
        }

        // supprimer image si elle existe
        if (hotel.image) {
            const filePath = hotel.image.replace("http://localhost:5000/", "")

            fs.unlink(filePath, (err) => {
                if (err) {
                    console.log("Erreur suppression image :", err.message)
                } else {
                    console.log("Image supprimée :", filePath)
                }
            })
        }

        await Hotel.findByIdAndDelete(req.params.id)

        res.json({ message: "Hôtel supprimé avec succès" })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}