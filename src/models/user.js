const mongoose = require('mongoose');
const connectToDatabase = require('./db');

connectToDatabase();

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  secretNote: { type: String, required: false, default: "" },
  score: { type: Number, default: 0 },
  profilePic: { type: String, default: "avatar.jpg" },
  status: { type: String, default: "ACTIVE"}, // ACTIVE, BANNED
  solves: { type: Object, default: {1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0,10:0} }
});

// Check password
userSchema.methods.comparePassword = async function (password) {
  try {
    console.log('password:', password);
    console.log('this.password:', this.password)
    return (password === this.password);
  } catch (err) {
    throw new Error(err);
  }
};

const User = mongoose.model('User', userSchema);

module.exports = User;
