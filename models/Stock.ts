import { Document, Schema, model } from 'mongoose';
import { IBroker } from './User';
import { ICurrency } from './Currency';

export interface IStock extends Document {
    buyDate: Date;
    title: string;
    count: number;
    pricePerSingle: number;
    priceSumWithFee: number;
    pricePerSingleWithFee: number;
    fee: number;
    currency: ICurrency;
    broker: IBroker;
    type: 'stock' | 'bond' | 'futures';
    sellDate?: Date;
    sellPricePerSingle?: number;
    sellPriceSum?: number;
    profite?: number;
}

const stock = new Schema({
    buyDate: { type: Date, required: true },
    title: { type: String, required: true },
    count: { type: Number, required: true },
    pricePerSingle: { type: Number, required: true },
    priceSumWithFee: { type: Number, required: true },
    pricePerSingleWithFee: { type: Number, required: true },
    fee: { type: Number, required: true },
    currency: {
        type: Schema.Types.ObjectId,
        ref: 'Currency',
        required: true,
    },
    broker: { type: Schema.Types.ObjectId, ref: 'Broker', required: true },
    type: { type: String, enum: ['stock', 'bond', 'futures'], required: true },
    sellDate: { type: Date, required: false },
    sellPricePerSingle: { type: Number, required: false },
    sellPriceSum: { type: Number, required: false },
    profite: { type: Number, required: false },
});

export const Stock = model<IStock>('Stock', stock);
