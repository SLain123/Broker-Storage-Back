import { Document, Schema, model } from 'mongoose';
import { ICurrency } from './Currency';
import { IStock } from './Stock';
import { IBroker } from './Broker';
import { IDividend } from './Dividend';


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
    brokerAccounts: {
        type: [Schema.Types.ObjectId],
        ref: 'Broker',
        required: false,
    },
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
