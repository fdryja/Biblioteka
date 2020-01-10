const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);

const historySchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    book: {type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true},
    member: {type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true},
    dateRent: {type: Date,  required: true},
    dateReturned: {type: Date,  required: true, default: Date.now()}
});

module.exports = mongoose.model('History', historySchema);