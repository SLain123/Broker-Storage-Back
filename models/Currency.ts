import { Document, Schema, model } from 'mongoose';

export interface ICurrency extends Document {
    title: string;
    ticker: string;
}

const currency = new Schema({
    title: { type: String, required: true, unique: true },
    ticker: { type: String, required: true, unique: true },
});

export const Currency = model<ICurrency>('Currency', currency);
