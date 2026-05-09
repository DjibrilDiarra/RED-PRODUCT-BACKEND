const mongoose = require("mongoose")

const hotelSchema = new mongoose.Schema({
  nom: String,
  adresse: String,
  prix: Number,
  image: String
}, { timestamps: true })

module.exports = mongoose.model("Hotel", hotelSchema)