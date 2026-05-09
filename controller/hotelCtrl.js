const Hotel = require("../models/Hotel")

exports.creerHotel = async (req, res) => {
  try {
    console.log("FILE REÇU :", req.file)

    if (!req.file) {
      return res.status(400).json({ message: "Image manquante" })
    }

    const BASE_URL = process.env.BASE_URL

    const imageUrl = `${BASE_URL}/uploads/${req.file.filename}`

    const hotel = new Hotel({
      nom: req.body.nom,
      adresse: req.body.adresse,
      prix: req.body.prix,
      image: imageUrl
    })

    await hotel.save()

    res.status(201).json(hotel)

  } catch (err) {
    console.log(err)
    res.status(500).json({ error: err.message })
  }
}


exports.listerHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find()
    res.json(hotels)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.getHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id)
    res.json(hotel)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.supprimerHotel = async (req, res) => {
  try {
    await Hotel.findByIdAndDelete(req.params.id)
    res.json({ message: "supprimé" })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}