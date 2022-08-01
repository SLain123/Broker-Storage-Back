"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Currency = void 0;
const mongoose_1 = require("mongoose");
const currency = new mongoose_1.Schema({
    title: { type: String, required: true, unique: true },
    ticker: { type: String, required: true, unique: true },
});
exports.Currency = mongoose_1.model('Currency', currency);
//# sourceMappingURL=Currency.js.map