const { Schema, model } = require('mongoose');

const currency = new Schema({
    title: { type: String, required: true, unique: true },
    ticker: { type: String, required: true, unique: true },
});

module.exports = model('Currency', currency);
