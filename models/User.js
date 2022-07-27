const { Schema, model } = require('mongoose');

const broker = new Schema({
    title: { type: String, required: true },
    currency: { type: Schema.ObjectId, ref: 'Currency', required: true },
    sumBalance: { type: Number, required: true },
    cash: { type: Number, required: true },
    sumStokes: { type: Number, required: true },
});

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

const dividend = new Schema({
    stockTitle: { type: String, required: true },
    reciveDate: { type: Date, required: true },
    sumPriceBuyngStoсk: { type: Number, required: true },
    payment: { type: Number, required: true },
});

const user = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    nickName: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], required: true },
    defaultCurrency: {
        type: Schema.ObjectId,
        ref: 'Currency',
        required: true,
    },
    avatar: { type: String, required: false },
    brokerCounts: { type: [broker], required: false },
    separatelyStoсks: {
        type: [stock],
        required: false,
    },
    activeStoсks: {
        type: [stock],
        required: false,
    },
    relatedPayments: {
        type: [dividend],
        required: false,
    },
});

module.exports = model('User', user);
