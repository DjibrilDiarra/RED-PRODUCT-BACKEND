const fs = require('fs')
const path = require('path')
const Hotel = require('../models/Hotel')

// CREER HOTEL
exports.creerHotel = async (req, res) => {
  try {

    const imageUrl = req.file
      ? `${process.env.BASE_URL}/uploads/${req.file.filename}`
      : null

    const hotel = new Hotel({
      nom: req.body.nom,
      adresse: req.body.adresse,
      prix: req.body.prix,
      image: imageUrl
    })

    await hotel.save()

    console.log("IMAGE OK :", imageUrl)

    res.json(hotel)

  } catch (err) {
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


// Ajouter HOTEL
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

        // SUPPRESSION IMAGE PROPRE (PRODUCTION SAFE)
        if (hotel.image) {
            const imageUrl = hotel.image

            const filePath = imageUrl.replace(
                `${process.env.BASE_URL}/`,
                ""
            )

            const fullPath = path.join(__dirname, "../", filePath)

            fs.unlink(fullPath, (err) => {
                if (err) {
                    console.log("Erreur suppression image :", err.message)
                } else {
                    console.log("Image supprimée :", fullPath)
                }
            })
        }

        await Hotel.findByIdAndDelete(req.params.id)

        res.json({ message: "Hôtel supprimé avec succès" })

    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}