const mongoose = require("mongoose")
require("dotenv").config()

const Hotel = require("./models/Hotel")

const OLD_URL = "https://red-product-backend.onrender.com"
const NEW_URL = "https://red-product-backend-2hqv.onrender.com"

async function fixImages() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log("MongoDB connecté")

    const hotels = await Hotel.find()

    let count = 0

    for (let hotel of hotels) {
      if (hotel.image && hotel.image.includes(OLD_URL)) {
        hotel.image = hotel.image.replace(OLD_URL, NEW_URL)
        await hotel.save()
        count++
      }
    }

    console.log(`✔ Correction terminée : ${count} images mises à jour`)

    mongoose.disconnect()

  } catch (err) {
    console.log("Erreur :", err)
  }
}

fixImages()