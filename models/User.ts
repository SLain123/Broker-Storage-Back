import { Document, Schema, model } from 'mongoose';
import { ICurrency } from './Currency';
import { IStock } from './Stock';
import { IDividend } from './Dividend';

export interface IBroker extends Document {
    title: string;
    currency: ICurrency;
    cash: number;
    sumStokes: number;
    sumBalance: number;
    status: 'active' | 'inactive';
}

export interface IUser extends Document {
    email: string;
    password: string;
    nickName: string;
    role: 'admin' | 'user';
    defaultCurrency: ICurrency;
    avatar: string | null;
    brokerAccounts: IBroker[] | [];
    stoсks: IStock[];
    relatedPayments: IDividend[];
}

export const broker = new Schema({
    title: { type: String, required: true },
    currency: { type: Schema.Types.ObjectId, ref: 'Currency', required: true },
    cash: { type: Number, required: true },
    sumStokes: { type: Number, required: true },
    sumBalance: { type: Number, required: true },
    status: { type: String, enum: ['active', 'inactive'], required: true },
});

const user = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    nickName: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], required: true },
    defaultCurrency: {
        type: Schema.Types.ObjectId,
        ref: 'Currency',
        required: true,
    },
    avatar: { type: String, required: false },
    brokerAccounts: { type: [broker], required: false },
    stoсks: {
        type: [Schema.Types.ObjectId],
        ref: 'Stock',
        required: false,
    },
    relatedPayments: {
        type: [Schema.Types.ObjectId],
        ref: 'Dividend',
        required: false,
    },
});

export const User = model<IUser>('User', user);
