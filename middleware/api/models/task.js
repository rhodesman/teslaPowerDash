const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PowerSchema = new Schema({
    Created_date: {
        type: Date,
        default: Date.now
    },
    grid: {
        type: String,
        required: true
    },
    battery: {
        type: String,
        required: true
    },
    house: {
        type: String,
        required: true
    },
    solar: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Data', PowerSchema);