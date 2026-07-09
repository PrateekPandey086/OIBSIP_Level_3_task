const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
    label: { type: String, default: 'Home' },
    street: String,
    city: String,
    state: String,
    zipCode: String,
    isDefault: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true, minlength: 6, select: false },
        phone: { type: String, default: '' },
        role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
        avatar: { type: String, default: '' },
        isVerified: { type: Boolean, default: false },
        isDisabled: { type: Boolean, default: false },
        addresses: [addressSchema],
        rewardPoints: { type: Number, default: 0 },
        badges: [{ type: String }],
        refreshToken: { type: String, select: false },
        emailVerificationToken: { type: String, select: false },
        passwordResetToken: { type: String, select: false },
        passwordResetExpires: { type: Date, select: false },
    },
    { timestamps: true }
);

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
