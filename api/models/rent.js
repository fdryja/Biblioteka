const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
const rentSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    book: {type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true, unique: true},
    date: {type: Date, default: Date.now()}
});

module.exports = mongoose.model('Rent', rentSchema);