const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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

// Hash the user password before saving to the database
// userSchema.pre('save', async function (next) {
//   try {
//     if (!this.isModified('password')) {
//       return next();
//     }
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(this.password, salt);
//     this.password = hashedPassword;
//     next();
//   } catch (err) {
//     next(err);
//   }
// });

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

// Compare user password with hashed password
// userSchema.methods.comparePassword = async function (password) {
//   try {
//     return await bcrypt.compare(password, this.password);
//   } catch (err) {
//     throw new Error(err);
//   }
// };

const User = mongoose.model('User', userSchema);

module.exports = User;
