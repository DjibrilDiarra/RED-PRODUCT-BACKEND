const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')      
require('dotenv').config()                

const router = require('./route/route')

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true })) 

// IMPORTANT POUR LES IMAGES
app.use('/uploads', express.static('uploads'))

app.use(router)

//  CONNEXION MONGO
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log(" MongoDB connecté"))
    .catch(err => console.log("Erreur Mongo :", err))


app.listen(5000, () => {
    console.log("Serveur actif : http://localhost:5000")
})

app.get('/test', (req, res) => {
    res.json({ ok: true })
})