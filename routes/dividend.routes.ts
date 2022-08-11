import { IBroker } from './../models/Broker';
import { Router, Request, Response } from 'express';
import { check, validationResult } from 'express-validator';
import { Types } from 'mongoose';

import { User } from '../models/User';
import { Stock, IStock, Status } from '../models/Stock';
import { Dividend, IDividend } from '../models/Dividend';
import { Broker } from '../models/Broker';
import { checkAuth } from '../middleware/auth.middleware';
import { return400 } from '../utils/return400';
import { returnValidationResult } from '../utils/returnValidationResult';

import { Error, Success, Val } from '../utils/getTexts';

const router = Router();

// /api/dividend/create
router.post(
    '/create',
    [
        check('stockId', Val.incorrectId).custom((id) =>
            Types.ObjectId.isValid(id),
        ),
        check('date', Val.missingDate).isDate(),
        check('payment', Val.missingPayment).isFloat({ min: 0 }),
    ],
    checkAuth,
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return returnValidationResult(res, errors);
            }

            const { stockId, date, payment } = req.body;

            const userData = await User.findById(req.user.userId).populate({
                path: 'stocks',
                populate: 'broker',
            });
            if (!userData) {
                return return400(res, Error.userNotFound);
            }

            let currentStock: IStock = null;
            userData.stocks.forEach((stock) => {
                if (String(stock._id) === String(new Types.ObjectId(stockId))) {
                    currentStock = stock;
                }
            });
            if (!currentStock) {
                return return400(res, Error.unexistedStock);
            }

            const { deltaBuy, currency, restCount, broker } = currentStock;
            if (currentStock.broker.status !== 'active') {
                return return400(res, Error.inactiveBroker);
            }
            if (currentStock.status !== Status.active) {
                return return400(res, Error.inactiveStock);
            }

            const dividendDate = {
                date: new Date(date),
                currency,
                sumPriceBuyngStoсk: deltaBuy * restCount,
                payment,
            };

            const dividend = new Dividend(dividendDate);
            dividend.save().then(async ({ _id }) => {
                await Stock.findByIdAndUpdate(stockId, {
                    $push: {
                        dividends: {
                            _id,
                            ...dividendDate,
                        },
                    },
                });

                await Broker.findByIdAndUpdate(broker._id, {
                    cash: broker.cash + payment,
                    sumBalance: broker.cash + payment + broker.sumStocks,
                });

                return res.json({
                    message: Success.dividendCreated,
                    payment: { _id, ...dividendDate },
                });
            });
        } catch (e) {
            res.status(500).json({ message: Error.somethingWrong });
        }
    },
);

// /api/dividend/remove
router.post(
    '/remove',
    [check('id', Val.incorrectId).custom((id) => Types.ObjectId.isValid(id))],
    checkAuth,
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return returnValidationResult(res, errors);
            }

            const userData = await User.findById(req.user.userId).populate([
                {
                    path: 'stocks',
                    populate: { path: 'dividends', model: 'Dividend' },
                },
                {
                    path: 'stocks',
                    populate: { path: 'broker', model: 'Broker' },
                },
            ]);
            if (!userData) {
                return return400(res, Error.userNotFound);
            }

            let currentStock: IStock = null;
            let divIndex = -1;
            userData.stocks.forEach((stock) => {
                stock.dividends.forEach((divItem, index) => {
                    if (
                        String(req.body.id) ===
                        String(new Types.ObjectId(divItem._id))
                    ) {
                        currentStock = stock;
                        divIndex = index;
                    }
                });
            });
            if (divIndex === -1) {
                return return400(res, Error.divNotFound);
            }

            const { _id, dividends, broker } = currentStock;
            const newDivList = [
                ...dividends.slice(0, divIndex),
                ...dividends.slice(divIndex + 1),
            ];
            await Dividend.findByIdAndRemove(req.body.id);
            await Stock.findByIdAndUpdate(_id, {
                dividends: newDivList,
            });

            const { _id: brokerId, cash: currentCash, sumStocks } = broker;
            const newCash = currentCash - dividends[divIndex].payment;
            await Broker.findByIdAndUpdate(brokerId, {
                cash: newCash,
                sumBalance: sumStocks + newCash,
            });

            return res.json({
                message: Success.dividendRemoved,
            });
        } catch (e) {
            res.status(500).json({ message: Error.somethingWrong });
        }
    },
);

export = router;
