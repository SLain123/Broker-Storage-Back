import { Document, Schema, model } from 'mongoose';
import { ICurrency } from './Currency';

export interface IActive extends Document {
    title: string;
    currency: ICurrency;
    cash: number;
}

const active = new Schema({
    title: { type: String, required: true },
    currency: {
        type: Schema.Types.ObjectId,
        ref: 'Currency',
        required: true,
    },
    cash: { type: Number, required: true },
});

export const Dividend = model<IActive>('Active', active);
