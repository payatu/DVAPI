const mongoose = require('mongoose');
const connectToDatabase = require('./db');

connectToDatabase();

const challengeSchema = new mongoose.Schema({
  challengeNo: { type: Number, required: true, unique: true},
  flag: { type: String, required: true}
})

const Challenge = mongoose.model('Challenge', challengeSchema);

module.exports = Challenge;
