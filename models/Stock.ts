import { Document, Schema, model } from 'mongoose';

import { IBroker } from './Broker';
import { ICurrency } from './Currency';
import { IDividend } from './Dividend';
import { IHistory } from './StockHistory';

export enum Status {
    active = 'active',
    closed = 'closed',
}

export enum StockType {
    stock = 'stock',
    bond = 'bond',
    futures = 'futures',
    currency = 'currency',
}

export interface IStock extends Document {
    status: Status;
    lastEditedDate: Date;
    title: string;
    restCount: number;
    deltaBuy: number;
    deltaSell: number;
    fee: number;
    currency: ICurrency;
    broker: IBroker;
    type: StockType;
    history: IHistory[];
    profit?: number;
    dividends?: IDividend[];
}

const stock = new Schema({
    status: { type: String, enum: ['active', 'closed'], required: true },
    lastEditedDate: { type: Date, required: true },
    title: { type: String, required: true },
    restCount: { type: Number, required: true },
    deltaBuy: { type: Number, required: true },
    deltaSell: { type: Number, required: true },
    fee: { type: Number, required: true },
    currency: {
        type: Schema.Types.ObjectId,
        ref: 'Currency',
        required: true,
    },
    broker: { type: Schema.Types.ObjectId, ref: 'Broker', required: true },
    type: {
        type: String,
        enum: StockType,
        required: true,
    },
    history: {
        type: [Schema.Types.ObjectId],
        ref: 'StockHistory',
        required: true,
    },
    profit: { type: Number, required: false },
    dividends: {
        type: [Schema.Types.ObjectId],
        ref: 'Dividend',
        required: false,
    },
});

export const Stock = model<IStock>('Stock', stock);
