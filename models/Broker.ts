import { Document, Schema, model } from 'mongoose';
import { ICurrency } from './Currency';

export interface IBroker extends Document {
    title: string;
    currency: ICurrency;
    cash: number;
    sumStokes: number;
    sumBalance: number;
    status: 'active' | 'inactive';
}

const broker = new Schema({
    title: { type: String, required: true },
    currency: { type: Schema.Types.ObjectId, ref: 'Currency', required: true },
    cash: { type: Number, required: true },
    sumStokes: { type: Number, required: true },
    sumBalance: { type: Number, required: true },
    status: { type: String, enum: ['active', 'inactive'], required: true },
});

export const Broker = model<IBroker>('Broker', broker);
