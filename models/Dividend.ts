import { Document, Schema, model } from 'mongoose';
import { ICurrency } from './Currency';

export interface IDividendData {
    date: Date;
    currency: ICurrency;
    sumPriceBuyngStoсk: number;
    payment: number;
}

export interface IDividend extends Document, IDividendData {}

const dividend = new Schema({
    date: { type: Date, required: true },
    currency: {
        type: Schema.Types.ObjectId,
        ref: 'Currency',
        required: true,
    },
    sumPriceBuyngStoсk: { type: Number, required: true },
    payment: { type: Number, required: true },
});

export const Dividend = model<IDividend>('Dividend', dividend);
