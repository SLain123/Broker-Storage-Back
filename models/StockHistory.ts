import { Document, Schema, model } from 'mongoose';

export interface IHistoryData {
    date: Date;
    count: number;
    pricePerSingle: number;
    fee: number;
    action: 'buy' | 'sell';
}

export interface IHistory extends Document, IHistoryData {}

const history = new Schema({
    date: { type: Date, required: true },
    count: { type: Number, required: true },
    pricePerSingle: { type: Number, required: true },
    fee: { type: Number, required: true },
    action: { type: String, enum: ['buy', 'sell'], required: true },
});

export const StockHistory = model<IHistory>('Stock_History', history);
