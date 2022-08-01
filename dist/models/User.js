"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.broker = void 0;
const mongoose_1 = require("mongoose");
exports.broker = new mongoose_1.Schema({
    title: { type: String, required: true },
    currency: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Currency', required: true },
    cash: { type: Number, required: true },
    sumStokes: { type: Number, required: true },
    sumBalance: { type: Number, required: true },
    status: { type: String, enum: ['active', 'inactive'], required: true },
});
const user = new mongoose_1.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    nickName: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], required: true },
    defaultCurrency: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Currency',
        required: true,
    },
    avatar: { type: String, required: false },
    brokerAccounts: { type: [exports.broker], required: false },
    stoсks: {
        type: [mongoose_1.Schema.Types.ObjectId],
        ref: 'Stock',
        required: false,
    },
    relatedPayments: {
        type: [mongoose_1.Schema.Types.ObjectId],
        ref: 'Dividend',
        required: false,
    },
});
exports.User = mongoose_1.model('User', user);
//# sourceMappingURL=User.js.map