const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {type: String, required: true},
    author: {type: String, required: true}
});3

module.exports = mongoose.model('Book', bookSchema);