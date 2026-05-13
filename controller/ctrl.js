const User = require("../models/user")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const axios = require("axios")

// ================= INSCRIPTION =================

exports.inscription = async (req, res) => {
    console.log("ROUTE INSCRIPTION APPELÉE")

    try {
        const { nom, email, password } = req.body

        if (!nom || !email || !password) {
            return res.status(400).json({ message: "Champs manquants" })
        }

        // Vérifier email
        const exist = await User.findOne({ email })
        if (exist) {
            return res.status(400).json({ message: "Email déjà utilisé" })
        }

        // Hash password
        const hash = await bcrypt.hash(password, 10)

        // Token verification
        const verificationToken = crypto.randomBytes(32).toString("hex")

        // Create user
        await User.create({
            nom,
            email,
            password: hash,
            verificationToken,
            isVerified: false
        })

        console.log("USER CRÉÉ ✔")

        // ================= EMAIL BREVO =================

        try {
            console.log("ENVOI EMAIL BREVO...")

            const response = await axios.post(
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

                            <p>Merci pour ton inscription.</p>

                            <p>Active ton compte en cliquant ici :</p>

                            <a href="${process.env.BASE_URL}/verify/${verificationToken}"
                               style="display:inline-block;padding:12px 20px;background:green;color:white;text-decoration:none;border-radius:5px">
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
            console.log(response.data)

        } catch (brevoError) {
            console.log("ERREUR BREVO :", brevoError.response?.data || brevoError.message)
        }

        return res.status(201).json({
            message: "Inscription réussie. Vérifie ton email."
        })

    } catch (err) {
        console.log("Erreur inscription :", err)
        return res.status(500).json({ message: "Erreur serveur" })
    }
}


// ================= VERIFICATION EMAIL =================

exports.verifyAccount = async (req, res) => {
    try {
        const { token } = req.params

        const user = await User.findOne({ verificationToken: token })

        if (!user) {
            return res.status(400).json({ message: "Lien invalide ou expiré" })
        }

        user.isVerified = true
        user.verificationToken = undefined

        await user.save()

        console.log("COMPTE ACTIVÉ ✔")

        return res.redirect(`${process.env.FRONT_URL}/connexion.html`)

    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Erreur serveur" })
    }
}


// ================= CONNEXION =================

exports.connexion = async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await User.findOne({ email })

        if (!user) {
            return res.status(404).json({ message: "Utilisateur introuvable" })
        }

        if (!user.isVerified) {
            return res.status(403).json({
                message: "Active ton email avant de te connecter"
            })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(400).json({ message: "Mot de passe incorrect" })
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || "SECRET_KEY",
            { expiresIn: "1d" }
        )

        return res.json({
            message: "Connexion réussie",
            token
        })

    } catch (err) {
        console.log("Erreur connexion :", err)
        return res.status(500).json({ message: "Erreur serveur" })
    }
}