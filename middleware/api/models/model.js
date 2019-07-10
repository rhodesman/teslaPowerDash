var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PowerSchema = new Schema({
    Created_date: {
        type: Date,
        default: Date.now
    },
    grid: {
        type: String,
        required: 'enter grid output'
    },
    battery: {
        type: String,
        required: 'enter battery output'
    },
    house: {
        type: String,
        required: 'enter house output'
    },
    solar: {
        type: String,
        required: 'enter solar output'
    }
});

module.exports = mongoose.model('Data', PowerSchema);