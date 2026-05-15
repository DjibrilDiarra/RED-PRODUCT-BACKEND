const mongoose = require("mongoose")
const bcrypt = require("bcrypt")

const userSchema = new mongoose.Schema({
    nom: { type: String, required: true },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    password: { type: String, required: true },

    isVerified: {
        type: Boolean,
        default: false
    },

    verificationToken: String,

    resetToken: String,
    resetTokenExpire: Date,
})

// HASH PASSWORD UNIQUEMENT ICI
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next()

    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)

    next()
})

module.exports = mongoose.model("User", userSchema)