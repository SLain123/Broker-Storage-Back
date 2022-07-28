const { Schema, model } = require('mongoose');

const broker = new Schema({
    title: { type: String, required: true },
    currency: { type: Schema.ObjectId, ref: 'Currency', required: true },
    cash: { type: Number, required: true },
    sumStokes: { type: Number, required: true },
    sumBalance: { type: Number, required: true },
    status: { type: String, enum: ['active', 'inactive'], required: true },
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
    brokerAccounts: { type: [broker], required: false },
    stoсks: {
        type: [Schema.ObjectId],
        ref: 'Stock',
        required: false,
    },
    relatedPayments: {
        type: [Schema.ObjectId],
        ref: 'Dividend',
        required: false,
    },
});

module.exports = model('User', user);
