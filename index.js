const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const path = require("path")
require("dotenv").config()

const router = require("./route/route")

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 🔥 IMPORTANT
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

app.use(router)

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connecté"))
  .catch(err => console.log("Erreur MongoDB:", err))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log("Serveur :", PORT))