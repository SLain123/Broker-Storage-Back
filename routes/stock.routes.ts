import { Router, Request, Response } from 'express';
import { check, validationResult } from 'express-validator';
import { Types } from 'mongoose';

import { User } from '../models/User';
import { IBroker, Broker } from '../models/Broker';
import { Stock, IStock } from '../models/Stock';
import { checkAuth } from '../middleware/auth.middleware';
import { return400 } from '../utils/return400';
import { returnValidationResult } from '../utils/returnValidationResult';

const router = Router();

// /api/stock
router.post(
    '/',
    [
        check('id', 'ID was not recived or incorrect').custom((id) =>
            Types.ObjectId.isValid(id),
        ),
    ],
    checkAuth,
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return returnValidationResult(res, errors);
            }

            const result = await User.findById(req.user.userId).populate([
                {
                    path: 'stocks',
                    populate: {
                        path: 'broker',
                        populate: { path: 'currency' },
                    },
                },
                { path: 'stocks', populate: 'currency' },
            ]);

            if (!result) {
                return return400(res, 'User not found');
            }
            const { stocks } = result;
            const stock = stocks.filter(
                ({ _id }) =>
                    String(new Types.ObjectId(req.body.id)) ===
                    String(new Types.ObjectId(_id)),
            );

            if (stock.length < 1) {
                return return400(res, 'Stock not found');
            }

            return res.json({
                message: 'Stoсk was found',
                stock,
            });
        } catch (e) {
            res.status(500).json({ message: 'Something was wrong...' });
        }
    },
);

// /api/stock/all
router.post(
    '/all',
    [
        check('filters', 'Incorrect filter format or no existing filter name')
            .optional()
            .isObject()
            .custom(
                (obj: Object) =>
                    obj.hasOwnProperty('brokerId') ||
                    obj.hasOwnProperty('currencyId') ||
                    obj.hasOwnProperty('year') ||
                    obj.hasOwnProperty('isSold') ||
                    obj.hasOwnProperty('type'),
            ),
    ],
    checkAuth,
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return returnValidationResult(res, errors);
            }

            const result = await User.findById(req.user.userId).populate([
                {
                    path: 'stocks',
                    populate: {
                        path: 'broker',
                        populate: { path: 'currency' },
                    },
                },
                { path: 'stocks', populate: 'currency' },
            ]);

            if (!result) {
                return return400(res, 'User not found');
            }
            const { filters } = req.body;
            let { stocks } = result;

            if (filters) {
                if (filters.hasOwnProperty('brokerId')) {
                    const { brokerId } = filters;
                    if (!Types.ObjectId.isValid(brokerId)) {
                        return return400(res, 'Wrong broker id format');
                    } else {
                        stocks = stocks.filter(
                            ({ broker }) =>
                                String(new Types.ObjectId(broker._id)) ===
                                String(new Types.ObjectId(brokerId)),
                        );
                    }
                }

                if (filters.hasOwnProperty('currencyId')) {
                    const { currencyId } = filters;
                    if (!Types.ObjectId.isValid(currencyId)) {
                        return return400(res, 'Wrong currency id format');
                    } else {
                        stocks = stocks.filter(
                            ({ currency }) =>
                                String(new Types.ObjectId(currency._id)) ===
                                String(new Types.ObjectId(currencyId)),
                        );
                    }
                }

                if (filters.hasOwnProperty('year')) {
                    const { year } = filters;
                    if (isNaN(+year) || String(year).length !== 4) {
                        return return400(res, 'Wrong year format');
                    } else {
                        stocks = stocks.filter(({ buyDate, sellDate }) => {
                            const buyYear = buyDate.getFullYear();
                            const sellYear = sellDate && sellDate.getFullYear();
                            return buyYear === +year || sellYear === +year;
                        });
                    }
                }

                if (filters.hasOwnProperty('isSold')) {
                    const { isSold } = filters;
                    stocks = stocks.filter(
                        ({ sellDate }) => Boolean(sellDate) === Boolean(isSold),
                    );
                }

                if (filters.hasOwnProperty('type')) {
                    const { type: filterType } = filters;
                    if (
                        filterType !== 'stock' &&
                        filterType !== 'bond' &&
                        filterType !== 'futures'
                    ) {
                        return return400(res, 'Unexisting type');
                    } else {
                        stocks = stocks.filter(
                            ({ type }) => type === filterType,
                        );
                    }
                }
            }

            return res.json({
                message: 'Stocks were found',
                stocks,
            });
        } catch (e) {
            res.status(500).json({ message: 'Something was wrong...' });
        }
    },
);

// /api/stock/buy
router.post(
    '/buy',
    [
        check('buyDate', 'Date of buying was missing').isDate(),
        check('title', 'Title of the stock was not received').isString(),
        check('count', 'Count of the stock was not specified').isFloat({
            min: 0,
        }),
        check(
            'pricePerSingle',
            'Price per one of stock was not recieved',
        ).isFloat({ min: 0 }),
        check('fee', "Broker's fee was not recieved").isFloat({ min: 0 }),
        check('brokerId', 'Broker ID was not recived or incorrect').custom(
            (id) => Types.ObjectId.isValid(id),
        ),
        check('type', 'Type of stock was not recived').custom(
            (type) => type === 'stock' || type === 'bond' || type === 'futures',
        ),
    ],
    checkAuth,
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return returnValidationResult(res, errors);
            }

            const {
                buyDate,
                title,
                count,
                pricePerSingle,
                fee,
                brokerId,
                type,
            } = req.body;

            const userData = await User.findById(req.user.userId).populate({
                path: 'brokerAccounts',
                populate: { path: 'currency' },
            });
            if (!userData) {
                return return400(res, 'User not found');
            }

            let currentBroker = null;
            let isEnoghCash = true;
            const allCost = pricePerSingle * count + fee;
            const brokerObjectId = new Types.ObjectId(brokerId);
            const { brokerAccounts } = userData;
            brokerAccounts.forEach((brokerItem: IBroker) => {
                const {
                    _id,
                    title,
                    currency,
                    cash,
                    sumStokes,
                    sumBalance,
                    status,
                } = brokerItem;
                if (String(_id) === String(brokerObjectId)) {
                    if (allCost > cash) {
                        isEnoghCash = false;
                    }

                    currentBroker = {
                        _id,
                        title,
                        currency,
                        cash,
                        sumStokes,
                        sumBalance,
                        status,
                    };
                }
            });
            if (!isEnoghCash) {
                return return400(res, 'Not enough cash for purchase');
            }
            if (!currentBroker) {
                return return400(res, 'Broker account was not found');
            }

            const stockData = {
                buyDate: new Date(buyDate),
                title,
                count,
                pricePerSingle,
                priceSumWithFee: pricePerSingle * count + fee,
                pricePerSingleWithFee: fee / count + pricePerSingle,
                fee,
                currency: currentBroker.currency,
                broker: currentBroker,
                type,
            };

            const stock = new Stock(stockData);
            stock.save().then(async ({ _id }) => {
                await Broker.findByIdAndUpdate(currentBroker._id, {
                    cash: currentBroker.cash - allCost,
                    sumStokes: currentBroker.sumStokes + allCost,
                });

                await User.findByIdAndUpdate(req.user.userId, {
                    $push: {
                        stocks: {
                            _id,
                            ...stockData,
                        },
                    },
                });
            });

            return res.json({
                message: 'The stock was created as purchased',
                stock,
            });
        } catch (e) {
            res.status(500).json({ message: 'Something was wrong...' });
        }
    },
);

// /api/stock/sell
router.post(
    '/sell',
    [
        check('id', 'ID was not recived or incorrect').custom((id) =>
            Types.ObjectId.isValid(id),
        ),
        check('sellDate', 'Date of selling was missing').isDate(),
        check(
            'sellPricePerSingle',
            'Price per one of stock was not recieved',
        ).isFloat({ min: 0 }),
        check('fee', "Broker's fee was not recieved").isFloat({ min: 0 }),
    ],
    checkAuth,
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return returnValidationResult(res, errors);
            }

            const { id, sellDate, sellPricePerSingle, fee } = req.body;

            const userData = await User.findById(req.user.userId).populate({
                path: 'stocks',
            });
            if (!userData) {
                return return400(res, 'User not found');
            }

            let currentStock: IStock | null = null;
            userData.stocks.forEach((stock) => {
                if (String(stock._id) === String(new Types.ObjectId(id))) {
                    currentStock = stock;
                }
            });
            if (!currentStock) {
                return return400(
                    res,
                    "The stock doesn't belong to the user or not exists",
                );
            }
            const sellPriceSum = sellPricePerSingle * currentStock.count - fee;
            const soldStock = await Stock.findByIdAndUpdate(id, {
                fee: fee + currentStock.fee,
                sellDate: new Date(sellDate),
                sellPricePerSingle,
                sellPriceSum,
                profite: sellPriceSum - currentStock.priceSumWithFee,
            });
            if (!soldStock) {
                return return400(res, 'The stock was not found');
            }

            return res.json({
                message: 'The stock was sold',
            });
        } catch (e) {
            res.status(500).json({ message: 'Something was wrong...' });
        }
    },
);

export = router;
