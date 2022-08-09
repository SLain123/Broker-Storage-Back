import { Document, Schema, model } from 'mongoose';
import { ICurrency } from './Currency';

export interface IBrokerData {
    title: string;
    currency: ICurrency;
    cash: number;
    sumStocks: number;
    sumBalance: number;
    status: 'active' | 'inactive';
}

export interface IBroker extends Document, IBrokerData {}

const broker = new Schema({
    title: { type: String, required: true },
    currency: { type: Schema.Types.ObjectId, ref: 'Currency', required: true },
    cash: { type: Number, required: true },
    sumStocks: { type: Number, required: true },
    sumBalance: { type: Number, required: true },
    status: { type: String, enum: ['active', 'inactive'], required: true },
});

export const Broker = model<IBroker>('Broker', broker);
