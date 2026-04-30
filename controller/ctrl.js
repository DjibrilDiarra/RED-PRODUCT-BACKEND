const User = require("../models/user")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")

// INSCRIPTION
exports.inscription = async (req, res) => {
    try {
        const { nom, email, password } = req.body

        const exist = await User.findOne({ email })
        if (exist) {
            return res.status(400).json({ message: "Email déjà utilisé" })
        }

        const hash = await bcrypt.hash(password, 10)

        const user = new User({
            nom,
            email,
            password: hash
        })

        await user.save()

        res.json({ message: "Inscription réussie" })

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Erreur serveur" })
    }
}


// LOGIN
exports.connexion = async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ message: "Utilisateur introuvable" })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ message: "Mot de passe incorrect" })
        }

        const token = jwt.sign(
            { id: user._id },
            "SECRET_KEY",
            { expiresIn: "1d" }
        )

        res.json({
            message: "Connexion réussie",
            token
        })

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Erreur serveur" })
    }
}


// MOT DE PASSE OUBLIÉ 
exports.motDePasseOublie = async (req, res) => {
    try {
        const { email } = req.body

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ message: "Utilisateur introuvable" })
        }

        const resetToken = crypto.randomBytes(32).toString("hex")

        user.resetToken = resetToken
        user.resetTokenExpire = Date.now() + 15 * 60 * 1000

        await user.save()

        res.json({
            message: "Token généré",
            resetToken
        })

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Erreur serveur" })
    }
}


// RESET PASSWORD
exports.resetMotDePasse = async (req, res) => {
    try {
        const { token, newPassword } = req.body

        console.log("TOKEN REÇU:", token)

        const user = await User.findOne({
            resetToken: token,
            resetTokenExpire: { $gt: Date.now() }
        })

        console.log("USER TROUVÉ:", user)

        if (!user) {
            return res.status(400).json({ message: "Token invalide ou expiré" })
        }

        const hash = await bcrypt.hash(newPassword, 10)

        user.password = hash
        user.resetToken = undefined
        user.resetTokenExpire = undefined

        await user.save()

        res.json({ message: "Mot de passe changé avec succès" })

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Erreur serveur" })
    }
}