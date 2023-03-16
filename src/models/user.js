const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectToDatabase = require('./db');

connectToDatabase();

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  secretNote: { type: String, required: false, default: "" },
  score: { type: Number, default: 0 },
  profilePic: { type: String, default: "" },
  status: { type: String, default: "ACTIVE"} // ACTIVE, BANNED
});

// Hash the user password before saving to the database
userSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password')) {
      return next();
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
  } catch (err) {
    next(err);
  }
});

// Compare user password with hashed password
userSchema.methods.comparePassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (err) {
    throw new Error(err);
  }
};

const User = mongoose.model('User', userSchema);

module.exports = User;
