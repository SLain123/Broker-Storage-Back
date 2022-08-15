import { Router, Request, Response } from 'express';
import { check, validationResult } from 'express-validator';
import { Types } from 'mongoose';

import { User } from '../models/User';
import { checkAuth } from '../middleware/auth.middleware';
import { return400 } from '../utils/return400';
import { returnValidationResult } from '../utils/returnValidationResult';

import { Error, Success, Val } from '../utils/getTexts';

const router = Router();

// /api/stat/fee
router.post(
    '/fee',
    [check('byYear', Val.wrongYear).optional().isInt({ min: 2000, max: 2100 })],
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
                    populate: { path: 'broker', model: 'Broker' },
                },
                { path: 'stocks', populate: 'currency' },
            ]);
            if (!userData) {
                return return400(res, Error.userNotFound);
            }

            const { byYear } = req.body;
            const tempStore = {};
            userData.stocks.forEach(
                ({ broker, fee, currency, lastEditedDate }) => {
                    const { _id } = broker;

                    if (byYear) {
                        const year = lastEditedDate.getFullYear();
                        const keyName = `${_id}/${year}`;

                        if (
                            tempStore.hasOwnProperty(keyName) &&
                            byYear === year
                        ) {
                            tempStore[keyName].fee =
                                tempStore[keyName].fee + fee;
                        } else if (byYear === year) {
                            tempStore[keyName] = {
                                fee,
                                currency,
                                broker,
                                year,
                            };
                        }
                    } else {
                        if (tempStore.hasOwnProperty(_id)) {
                            tempStore[_id].fee = tempStore[_id].fee + fee;
                        } else {
                            tempStore[_id] = { fee, currency, broker };
                        }
                    }
                },
            );

            return res.json({
                message: Success.activeFound,
                result: Object.values(tempStore),
            });
        } catch (e) {
            res.status(500).json({ message: Error.somethingWrong });
        }
    },
);

// /api/stat/dividends/active
router.post(
    '/dividends/active',
    [
        check('byYear', Val.wrongYear)
            .optional()
            .isInt({ min: 2000, max: 2100 }),
        // check('byType', Val.wrongType)
        //     .optional()
        //     .custom((type) => type === 'stock' || type === 'bond'),
    ],
    checkAuth,
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return returnValidationResult(res, errors);
            }

            const userData = await User.findById(req.user.userId).populate([
                {
                    path: 'actives',
                    populate: { path: 'dividends', model: 'Dividend' },
                },
                {
                    path: 'actives',
                    populate: 'currency',
                },
            ]);
            if (!userData) {
                return return400(res, Error.userNotFound);
            }

            const { byYear } = req.body;
            const tempStore = {};

            userData.actives.forEach((act) => {
                const { title, currency } = act;
                tempStore[title] = {
                    title,
                    currency,
                    allPayments: 0,
                    totalAmountOfInvest: 0,
                };

                act.dividends.forEach((div) => {
                    const { payment, sumPriceBuyngStoсk, date } = div;
                    const year = date.getFullYear();
                    const { allPayments, totalAmountOfInvest } =
                        tempStore[title];

                    if (byYear) {
                        if (byYear === year) {
                            tempStore[title].allPayments =
                                allPayments + payment;
                            tempStore[title].totalAmountOfInvest =
                                totalAmountOfInvest + sumPriceBuyngStoсk;
                        }
                    } else {
                        tempStore[title].allPayments = allPayments + payment;
                        tempStore[title].totalAmountOfInvest =
                            totalAmountOfInvest + sumPriceBuyngStoсk;
                    }
                });
            });

            return res.json({
                message: Success.calculatedDividendAct,
                result: Object.values(tempStore),
            });
        } catch (e) {
            res.status(500).json({ message: Error.somethingWrong });
        }
    },
);

// /api/stat/dividends
router.post(
    '/dividends',
    [check('byYear', Val.wrongYear).optional().isInt({ min: 2000, max: 2100 })],
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
                    populate: 'currency',
                },
            ]);
            if (!userData) {
                return return400(res, Error.userNotFound);
            }

            const { byYear } = req.body;
            const tempStore = {};

            userData.stocks.forEach((stock) => {
                const { currency, type } = stock;
                const keyName = `${currency._id}/${type}`;

                stock.dividends.forEach((div) => {
                    const { payment, sumPriceBuyngStoсk, date } = div;
                    const year = date.getFullYear();

                    if (!tempStore.hasOwnProperty(keyName)) {
                        tempStore[keyName] = {
                            currency,
                            type,
                            allPayments: 0,
                            totalAmountOfInvest: 0,
                        };
                    }
                    const { allPayments, totalAmountOfInvest } =
                        tempStore[keyName];

                    if (byYear) {
                        if (byYear === year) {
                            tempStore[keyName].allPayments =
                                allPayments + payment;
                            tempStore[keyName].totalAmountOfInvest =
                                totalAmountOfInvest + sumPriceBuyngStoсk;
                        }
                    } else {
                        tempStore[keyName].allPayments = allPayments + payment;
                        tempStore[keyName].totalAmountOfInvest =
                            totalAmountOfInvest + sumPriceBuyngStoсk;
                    }
                });
            });

            return res.json({
                message: Success.calculatedDividendStock,
                result: Object.values(tempStore),
            });
        } catch (e) {
            res.status(500).json({ message: Error.somethingWrong });
        }
    },
);

// /api/stat/profit
router.post(
    '/profit',
    [
        check('filters', Val.incorrectFilters)
            .optional()
            .isObject()
            .custom(
                (obj: Object) =>
                    obj.hasOwnProperty('brokerId') ||
                    obj.hasOwnProperty('currencyId') ||
                    obj.hasOwnProperty('year') ||
                    obj.hasOwnProperty('plusInactiveBrokers') ||
                    obj.hasOwnProperty('plusDividends'),
            ),
    ],
    checkAuth,
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return returnValidationResult(res, errors);
            }

            const { filters } = req.body;

            const userData = await User.findById(req.user.userId).populate([
                {
                    path: 'stocks',
                    populate: { path: 'dividends', model: 'Dividend' },
                },
                {
                    path: 'stocks',
                    populate: 'currency',
                },
                {
                    path: 'stocks',
                    populate: 'broker',
                },
            ]);
            if (!userData) {
                return return400(res, Error.userNotFound);
            }

            let filtredList = userData.stocks.filter(
                ({ status }) => status === 'closed',
            );

            if (!filters?.plusInactiveBrokers) {
                filtredList = filtredList.filter(
                    ({ broker }) => broker.status === 'active',
                );
            }

            if (filters) {
                if (filters.hasOwnProperty('brokerId')) {
                    const { brokerId } = filters;
                    if (!Types.ObjectId.isValid(brokerId)) {
                        return return400(res, Error.wrongBrokerId);
                    } else {
                        filtredList = filtredList.filter(
                            ({ broker }) =>
                                String(new Types.ObjectId(broker._id)) ===
                                String(new Types.ObjectId(brokerId)),
                        );
                    }
                }

                if (filters.hasOwnProperty('currencyId')) {
                    const { currencyId } = filters;
                    if (!Types.ObjectId.isValid(currencyId)) {
                        return return400(res, Error.wrongCurrencyId);
                    } else {
                        filtredList = filtredList.filter(
                            ({ currency }) =>
                                String(new Types.ObjectId(currency._id)) ===
                                String(new Types.ObjectId(currencyId)),
                        );
                    }
                }

                if (filters.hasOwnProperty('year')) {
                    const { year } = filters;
                    if (isNaN(+year) || String(year).length !== 4) {
                        return return400(res, Error.wrongYear);
                    } else {
                        filtredList = filtredList.filter(
                            ({ lastEditedDate }) => {
                                return lastEditedDate.getFullYear() === +year;
                            },
                        );
                    }
                }
            }

            let sumProfit = 0;
            filtredList.forEach(({ profit, dividends }) => {
                sumProfit += profit;

                if (filters) {
                    if (filters.hasOwnProperty('plusDividends'))
                        if (filters.hasOwnProperty('year')) {
                            const { year } = filters;

                            dividends.forEach(({ payment, date }) => {
                                const lastYear = date.getFullYear();
                                if (year === lastYear) {
                                    sumProfit += payment;
                                }
                            });
                        } else {
                            dividends.forEach(({ payment }) => {
                                sumProfit += payment;
                            });
                        }
                }
            });

            return res.json({
                message: Success.profitCalculated,
                sumProfit,
                filtredList,
            });
        } catch (e) {
            res.status(500).json({ message: Error.somethingWrong });
        }
    },
);

export = router;
