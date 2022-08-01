"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stock = void 0;
const mongoose_1 = require("mongoose");
const User_1 = require("./User");
const stock = new mongoose_1.Schema({
    buyDate: { type: Date, required: true },
    title: { type: String, required: true },
    count: { type: Number, required: true },
    pricePerSingle: { type: Number, required: true },
    priceSumWithFee: { type: Number, required: true },
    pricePerSingleWithFee: { type: Number, required: true },
    fee: { type: Number, required: true },
    currency: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Currency',
        required: true,
    },
    broker: { type: User_1.broker, required: true },
    type: { type: String, enum: ['stock', 'bond', 'futures'], required: false },
    sellDate: { type: Date, required: false },
    sellPricePerSingle: { type: Number, required: false },
    sellPriceSum: { type: Number, required: false },
    profite: { type: Number, required: false },
});
exports.Stock = mongoose_1.model('Stock', stock);
//# sourceMappingURL=Stock.js.map