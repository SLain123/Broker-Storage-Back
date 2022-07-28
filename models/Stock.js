const { Schema, model } = require('mongoose');

const stock = new Schema({
    buyDate: { type: Date, required: true },
    title: { type: String, required: true },
    count: { type: Number, required: true },
    pricePerSingle: { type: Number, required: true },
    priceSumWithFee: { type: Number, required: true },
    pricePerSingleWithFee: { type: Number, required: true },
    fee: { type: Number, required: true },
    currency: {
        type: Schema.ObjectId,
        ref: 'Currency',
        required: true,
    },
    broker: { type: broker, required: true },
    type: { type: String, enum: ['stock', 'bond', 'futures'], required: false },
    sellDate: { type: Date, required: false },
    sellPricePerSingle: { type: Number, required: false },
    sellPriceSum: { type: Number, required: false },
    profite: { type: Number, required: false },
});

module.exports = model('Stock', stock);
