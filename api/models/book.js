const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    author: String
});3

module.exports = mongoose.model('Book', bookSchema);