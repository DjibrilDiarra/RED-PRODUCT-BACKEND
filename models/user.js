const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    nom: String,

    email: {
        type: String,
        unique: true
    },

    password: String,

    isVerified: {
        type: Boolean,
        default: false
    },

    verificationToken: String,

    resetToken: String,

    resetTokenExpire: Date,
})

// HASH PASSWORD avant sauvegarde
userSchema.pre("save", async function(next) {

    if (!this.isModified("password")) {
        return next()
    }

    const salt = await bcrypt.genSalt(10)

    this.password = await bcrypt.hash(this.password, salt)

    next()
})

module.exports = mongoose.model('User', userSchema)