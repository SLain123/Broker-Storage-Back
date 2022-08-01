import { Document, Schema, model } from 'mongoose';
import { ICurrency } from './Currency';

export interface IDividend extends Document {
    stockTitle: string;
    reciveDate: Date;
    currency: ICurrency;
    sumPriceBuyngStoсk: number;
    payment: number;
}

const dividend = new Schema({
    stockTitle: { type: String, required: true },
    reciveDate: { type: Date, required: true },
    currency: {
        type: Schema.Types.ObjectId,
        ref: 'Currency',
        required: true,
    },
    sumPriceBuyngStoсk: { type: Number, required: true },
    payment: { type: Number, required: true },
});

export const Dividend = model<IDividend>('Dividend', dividend);
