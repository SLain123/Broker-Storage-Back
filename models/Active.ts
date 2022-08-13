import { Document, Schema, model } from 'mongoose';

import { ICurrency } from './Currency';
import { IDividend } from './Dividend';

export enum Status {
    active = 'active',
    closed = 'closed',
}

export interface IActive extends Document {
    title: string;
    currency: ICurrency;
    cash: number;
    dividends?: IDividend[];
    status: Status;
}

const active = new Schema({
    title: { type: String, required: true },
    currency: {
        type: Schema.Types.ObjectId,
        ref: 'Currency',
        required: true,
    },
    cash: { type: Number, required: true },
    dividends: {
        type: [Schema.Types.ObjectId],
        ref: 'Dividend',
        required: false,
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        required: true,
    },
});

export const Active = model<IActive>('Active', active);
