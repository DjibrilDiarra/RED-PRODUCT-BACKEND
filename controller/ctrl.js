const User = require("../models/user")
const crypto = require("crypto")
const axios = require("axios")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

// ================= INSCRIPTION =================
exports.inscription = async (req, res) => {
    console.log("INSCRIPTION ROUTE OK")
    console.log("BODY:", req.body)

    try {
        const { nom, email, password } = req.body

        // 🔴 champs obligatoires
        if (!nom || !email || !password) {
            return res.status(400).json({
                message: "Champs manquants"
            })
        }

        // 🔥 VALIDATION MOT DE PASSE AJOUTÉE
        if (!password || password.trim().length < 4) {
            return res.status(400).json({
                message: "Mot de passe trop court"
            })
        }

        const exist = await User.findOne({ email })

        if (exist) {
            return res.status(400).json({
                message: "Email déjà utilisé"
            })
        }

        const verificationToken = crypto.randomBytes(32).toString("hex")

        const user = new User({
            nom,
            email,
            password,
            verificationToken,
            isVerified: false
        })

        await user.save()

        console.log("USER CRÉÉ ✔")
        console.log("TOKEN:", user.verificationToken)

        // ================= EMAIL =================
        try {
            const verifyUrl = `${process.env.BASE_URL}/verify/${verificationToken}`

            await axios.post(
                "https://api.brevo.com/v3/smtp/email",
                {
                    sender: {
                        name: "RED PRODUCT",
                        email: "djibrildiarra470@gmail.com"
                    },
                    to: [{ email }],
                    subject: "Active ton compte RED PRODUCT",
                    htmlContent: `
                        <div style="font-family:Arial">
                            <h2>Bienvenue ${nom}</h2>
                            <p>Clique pour activer ton compte :</p>

                            <a href="${verifyUrl}"
                               style="display:inline-block;padding:10px 15px;background:green;color:white;text-decoration:none;border-radius:5px">
                                Activer mon compte
                            </a>
                        </div>
                    `
                },
                {
                    headers: {
                        "api-key": process.env.BREVO_API_KEY,
                        "Content-Type": "application/json"
                    }
                }
            )

            console.log("EMAIL ENVOYÉ ✔")

        } catch (err) {
            console.log("EMAIL ERROR:", err.response?.data || err.message)
        }

        return res.status(201).json({
            message: "Inscription réussie. Vérifie ton email."
        })

    } catch (err) {
        console.error("ERROR INSCRIPTION:", err)
        return res.status(500).json({
            message: "Erreur serveur"
        })
    }
}

exports.verifyAccount = async (req, res) => {
    try {
        const { token } = req.params

        console.log("TOKEN REÇU:", token)

        const user = await User.findOne({
            verificationToken: token
        })

        // 🔴 sécurité obligatoire
        if (!user) {
            return res.status(400).json({
                message: "Lien invalide ou déjà utilisé"
            })
        }

        user.isVerified = true
        user.verificationToken = undefined

        await user.save()

        console.log("COMPTE ACTIVÉ ✔")

        return res.redirect(
            `${process.env.FRONT_URL}/connexion.html`
        )

    } catch (err) {
        console.error("VERIFY ERROR:", err)
        return res.status(500).json({
            message: "Erreur serveur"
        })
    }
}

exports.connexion = async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await User.findOne({ email })

        if (!user) {
            return res.status(404).json({
                message: "Utilisateur introuvable"
            })
        }

        if (!user.isVerified) {
            return res.status(403).json({
                message: "Active ton email avant de te connecter"
            })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(400).json({
                message: "Mot de passe incorrect"
            })
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        )

        return res.json({
            message: "Connexion réussie",
            token
        })

    } catch (err) {
        console.error("LOGIN ERROR:", err)
        return res.status(500).json({
            message: "Erreur serveur"
        })
    }
}