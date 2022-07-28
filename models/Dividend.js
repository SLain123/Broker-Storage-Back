const { Schema, model } = require('mongoose');

const dividend = new Schema({
    stockTitle: { type: String, required: true },
    reciveDate: { type: Date, required: true },
    currency: {
        type: Schema.ObjectId,
        ref: 'Currency',
        required: true,
    },
    sumPriceBuyngStoсk: { type: Number, required: true },
    payment: { type: Number, required: true },
});

module.exports = model('Stock', dividend);
