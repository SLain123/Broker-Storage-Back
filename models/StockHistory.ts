import { Document, Schema, model } from 'mongoose';

export interface IHistory extends Document {
    date: Date;
    count: number;
    pricePerSingle: number;
    fee: number;
}

const history = new Schema({
    date: { type: Date, required: true },
    count: { type: Number, required: true },
    pricePerSingle: { type: Number, required: true },
    fee: { type: Number, required: true },
});

export const StockHistory = model<IHistory>('StockHistory', history);
