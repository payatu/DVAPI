const mongoose = require('mongoose');
const connectToDatabase = require('./db');

connectToDatabase();

const ticketSchema = new mongoose.Schema({
  ticketId: { type: Number, required: false },
  message: { type: String, required: false },
});


const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
