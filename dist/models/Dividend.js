"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dividend = void 0;
const mongoose_1 = require("mongoose");
const dividend = new mongoose_1.Schema({
    stockTitle: { type: String, required: true },
    reciveDate: { type: Date, required: true },
    currency: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Currency',
        required: true,
    },
    sumPriceBuyngStoсk: { type: Number, required: true },
    payment: { type: Number, required: true },
});
exports.Dividend = mongoose_1.model('Dividend', dividend);
//# sourceMappingURL=Dividend.js.map