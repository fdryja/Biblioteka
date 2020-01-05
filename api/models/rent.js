const mongoose = require('mongoose');

const rentSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    book: {type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true},
    date: {type: Date, default: Date.now()}
});

module.exports = mongoose.model('Rent', rentSchema);