import { Router, Request, Response } from 'express';
import { check, validationResult } from 'express-validator';
import { Types } from 'mongoose';

import { User } from '../models/User';
import { IBroker, Broker, IBrokerData } from '../models/Broker';
import { Stock, IStock, Status } from '../models/Stock';
import { IHistory, StockHistory } from '../models/StockHistory';
import { checkAuth } from '../middleware/auth.middleware';
import { return400 } from '../utils/return400';
import { returnValidationResult } from '../utils/returnValidationResult';
import { getProfite } from './../utils/getProfit';
import { getDeltaCount, IStockData } from './../utils/getDeltaCount';

const router = Router();

// // /api/stock
// router.post(
//     '/',
//     [
//         check('id', 'ID was not recived or incorrect').custom((id) =>
//             Types.ObjectId.isValid(id),
//         ),
//     ],
//     checkAuth,
//     async (req: Request, res: Response) => {
//         try {
//             const errors = validationResult(req);
//             if (!errors.isEmpty()) {
//                 return returnValidationResult(res, errors);
//             }

//             const result = await User.findById(req.user.userId).populate([
//                 {
//                     path: 'stocks',
//                     populate: {
//                         path: 'broker',
//                         populate: { path: 'currency' },
//                     },
//                 },
//                 { path: 'stocks', populate: 'currency' },
//             ]);

//             if (!result) {
//                 return return400(res, 'User not found');
//             }
//             const { stocks } = result;
//             const stock = stocks.filter(
//                 ({ _id }) =>
//                     String(new Types.ObjectId(req.body.id)) ===
//                     String(new Types.ObjectId(_id)),
//             );

//             if (stock.length < 1) {
//                 return return400(res, 'Stock not found');
//             }

//             return res.json({
//                 message: 'Stoсk was found',
//                 stock,
//             });
//         } catch (e) {
//             res.status(500).json({ message: 'Something was wrong...' });
//         }
//     },
// );

// // /api/stock/all
// router.post(
//     '/all',
//     [
//         check('filters', 'Incorrect filter format or no existing filter name')
//             .optional()
//             .isObject()
//             .custom(
//                 (obj: Object) =>
//                     obj.hasOwnProperty('brokerId') ||
//                     obj.hasOwnProperty('currencyId') ||
//                     obj.hasOwnProperty('year') ||
//                     obj.hasOwnProperty('isSold') ||
//                     obj.hasOwnProperty('type'),
//             ),
//     ],
//     checkAuth,
//     async (req: Request, res: Response) => {
//         try {
//             const errors = validationResult(req);
//             if (!errors.isEmpty()) {
//                 return returnValidationResult(res, errors);
//             }

//             const result = await User.findById(req.user.userId).populate([
//                 {
//                     path: 'stocks',
//                     populate: {
//                         path: 'broker',
//                         populate: { path: 'currency' },
//                     },
//                 },
//                 { path: 'stocks', populate: 'currency' },
//             ]);

//             if (!result) {
//                 return return400(res, 'User not found');
//             }
//             const { filters } = req.body;
//             let { stocks } = result;

//             if (filters) {
//                 if (filters.hasOwnProperty('brokerId')) {
//                     const { brokerId } = filters;
//                     if (!Types.ObjectId.isValid(brokerId)) {
//                         return return400(res, 'Wrong broker id format');
//                     } else {
//                         stocks = stocks.filter(
//                             ({ broker }) =>
//                                 String(new Types.ObjectId(broker._id)) ===
//                                 String(new Types.ObjectId(brokerId)),
//                         );
//                     }
//                 }

//                 if (filters.hasOwnProperty('currencyId')) {
//                     const { currencyId } = filters;
//                     if (!Types.ObjectId.isValid(currencyId)) {
//                         return return400(res, 'Wrong currency id format');
//                     } else {
//                         stocks = stocks.filter(
//                             ({ currency }) =>
//                                 String(new Types.ObjectId(currency._id)) ===
//                                 String(new Types.ObjectId(currencyId)),
//                         );
//                     }
//                 }

//                 if (filters.hasOwnProperty('year')) {
//                     const { year } = filters;
//                     if (isNaN(+year) || String(year).length !== 4) {
//                         return return400(res, 'Wrong year format');
//                     } else {
//                         stocks = stocks.filter(({ buyDate, sellDate }) => {
//                             const buyYear = buyDate.getFullYear();
//                             const sellYear = sellDate && sellDate.getFullYear();
//                             return buyYear === +year || sellYear === +year;
//                         });
//                     }
//                 }

//                 if (filters.hasOwnProperty('isSold')) {
//                     const { isSold } = filters;
//                     stocks = stocks.filter(
//                         ({ sellDate }) => Boolean(sellDate) === Boolean(isSold),
//                     );
//                 }

//                 if (filters.hasOwnProperty('type')) {
//                     const { type: filterType } = filters;
//                     if (
//                         filterType !== 'stock' &&
//                         filterType !== 'bond' &&
//                         filterType !== 'futures'
//                     ) {
//                         return return400(res, 'Unexisting type');
//                     } else {
//                         stocks = stocks.filter(
//                             ({ type }) => type === filterType,
//                         );
//                     }
//                 }
//             }

//             return res.json({
//                 message: 'Stocks were found',
//                 stocks,
//             });
//         } catch (e) {
//             res.status(500).json({ message: 'Something was wrong...' });
//         }
//     },
// );

// /api/stock/create
router.post(
    '/create',
    [
        check('date', 'Date of buying was missing').isDate(),
        check('title', 'Title of the stock was not received').isString(),
        check('count', 'Count of the stock was not specified').isInt({
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

            const { date, title, count, pricePerSingle, fee, brokerId, type } =
                req.body;

            const userData = await User.findById(req.user.userId).populate({
                path: 'brokerAccounts',
                populate: { path: 'currency' },
            });
            if (!userData) {
                return return400(res, 'User not found');
            }

            let currentBroker: (IBrokerData & { _id: string }) | null = null;
            const allCost = +pricePerSingle * +count + +fee;
            const brokerObjectId = new Types.ObjectId(brokerId);
            const { brokerAccounts } = userData;
            brokerAccounts.forEach((brokerItem: IBroker) => {
                const {
                    _id,
                    title,
                    currency,
                    cash,
                    sumStocks,
                    sumBalance,
                    status,
                } = brokerItem;
                if (String(_id) === String(brokerObjectId)) {
                    currentBroker = {
                        _id,
                        title,
                        currency,
                        cash,
                        sumStocks,
                        sumBalance,
                        status,
                    };
                }
            });
            if (currentBroker.cash < allCost) {
                return return400(res, 'Not enough cash for purchase');
            }
            if (!currentBroker || currentBroker.status !== 'active') {
                return return400(
                    res,
                    'Broker account was not found or inactive',
                );
            }

            const historyData = {
                date: new Date(date),
                count: +count,
                pricePerSingle: +pricePerSingle,
                fee: +fee,
                action: 'buy',
            };
            const stockMainData = {
                status: 'active',
                lastEditedDate: new Date(date),
                title,
                restCount: +count,
                deltaBuy: allCost / count,
                deltaSell: 0,
                fee: +fee,
                currency: currentBroker.currency,
                broker: currentBroker,
                type,
                profit: 0,
            };

            const history = new StockHistory(historyData);
            history.save().then(async ({ _id }) => {
                const stock = new Stock({
                    ...stockMainData,
                    history: [{ _id, ...historyData }],
                });

                await stock.save().then(async ({ _id }) => {
                    await Broker.findByIdAndUpdate(currentBroker._id, {
                        cash: currentBroker.cash - allCost,
                        sumStocks: currentBroker.sumStocks + allCost,
                    });

                    await User.findByIdAndUpdate(req.user.userId, {
                        $push: {
                            stocks: {
                                _id,
                                ...stockMainData,
                            },
                        },
                    });

                    return res.json({
                        message: 'The stock was created as purchased',
                        stock,
                    });
                });
            });
        } catch (e) {
            res.status(500).json({ message: 'Something was wrong...' });
        }
    },
);

// /api/stock/add
router.post(
    '/add',
    [
        check('id', 'ID was not recived or incorrect').custom((id) =>
            Types.ObjectId.isValid(id),
        ),
        check('date', 'Date of selling was missing').isDate(),
        check('count', 'Count of the stock was not specified').isInt({
            min: 0,
        }),
        check(
            'pricePerSingle',
            'Price per one of stock was not recieved',
        ).isFloat({ min: 0 }),
        check('fee', "Broker's fee was not recieved").isFloat({ min: 0 }),
        check('action', '"buy" or "sell" action must specifyed').custom(
            (act) => act === 'buy' || act === 'sell',
        ),
    ],
    checkAuth,
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return returnValidationResult(res, errors);
            }

            const { id, date, count, pricePerSingle, fee, action } = req.body;

            const userData = await User.findById(req.user.userId).populate([
                {
                    path: 'stocks',
                    populate: { path: 'history', model: 'Stock_History' },
                },
                {
                    path: 'stocks',
                    populate: { path: 'broker' },
                },
            ]);
            if (!userData) {
                return return400(res, 'User not found');
            }

            let currentStock: IStock | null = null;
            const sumBuyCost = +pricePerSingle * +count + +fee;
            const sumSellCost = +pricePerSingle * +count - +fee;
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

            if (currentStock.broker.status !== 'active') {
                return return400(res, 'Broker status is inactive');
            }
            if (currentStock.broker.cash < sumBuyCost && action === 'buy') {
                return return400(res, 'Not enough cash for purchase');
            }
            if (currentStock.status !== Status.active) {
                return return400(res, 'The stock already have closed status');
            }

            const historyData: IStockData = {
                date: new Date(date),
                count: +count,
                pricePerSingle: +pricePerSingle,
                fee: +fee,
                action,
            };

            const calculatedResults = getDeltaCount([
                ...currentStock.history,
                historyData,
            ]);
            const profitData = getProfite(calculatedResults);
            if (profitData.error || calculatedResults.error) {
                return return400(res, calculatedResults.error);
            }

            const { countRest, deltaBuy, deltaSell, allFee } =
                calculatedResults;
            const updatedMainStock = {
                status: countRest ? Status.active : Status.closed,
                lastEditedDate: new Date(date),
                restCount: countRest,
                deltaBuy,
                deltaSell,
                fee: allFee,
                profit: profitData.profit,
            };

            const history = new StockHistory(historyData);
            history.save().then(async ({ _id }) => {
                await Stock.findByIdAndUpdate(id, {
                    ...updatedMainStock,
                    $push: {
                        history: {
                            _id,
                            ...historyData,
                        },
                    },
                });

                let sumPrice = 0;
                const freshUserData = await User.findById(
                    req.user.userId,
                ).populate({
                    path: 'stocks',
                });
                freshUserData.stocks.forEach(({ deltaBuy, restCount }) => {
                    sumPrice += deltaBuy * restCount;
                });

                const newCash =
                    action === 'buy'
                        ? currentStock.broker.cash - sumBuyCost
                        : currentStock.broker.cash + sumSellCost;
                await Broker.findByIdAndUpdate(currentStock.broker._id, {
                    cash: newCash,
                    sumStocks: sumPrice,
                    sumBalance: newCash + sumPrice,
                });
            });

            return res.json({
                message: `Action <${action}> was added in stock history`,
            });
        } catch (e) {
            res.status(500).json({ message: 'Something was wrong...' });
        }
    },
);

// /api/stock/remove
router.post(
    '/remove',
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

            const userData = await User.findById(req.user.userId).populate([
                {
                    path: 'stocks',
                    populate: { path: 'history', model: 'Stock_History' },
                },
                {
                    path: 'stocks',
                    populate: { path: 'broker' },
                },
            ]);
            if (!userData) {
                return return400(res, 'User not found');
            }
            const { stocks } = userData;
            let currentStock: IStock | null = null;
            let currentHistoryItem: IHistory | null = null;
            let historyIndex = -1;
            let stockIndex = -1;
            stocks.forEach((stock, stockindex) => {
                stock.history.forEach((historyStock, histIndex) => {
                    if (
                        String(historyStock._id) ===
                        String(new Types.ObjectId(req.body.id))
                    ) {
                        currentStock = stock;
                        currentHistoryItem = historyStock;
                        historyIndex = histIndex;
                        stockIndex = stockindex;
                    }
                });
            });
            if (!currentStock) {
                return return400(
                    res,
                    "Stock doesn't belong to the user or not exists",
                );
            }

            const { _id, broker, history } = currentStock;
            if (broker.status !== 'active') {
                return return400(res, 'Broker status is inactive');
            }
            if (historyIndex === 0 && history.length > 1) {
                return return400(
                    res,
                    'Stock cannot be deleted because this operation is first and still exists other operations',
                );
            }

            const removedHistoryItem = await StockHistory.findByIdAndDelete(
                req.body.id,
            );
            if (!removedHistoryItem) {
                return return400(
                    res,
                    'Item of history was not found in main stock',
                );
            }

            if (history.length < 2) {
                const newStockList = [
                    ...stocks.slice(0, stockIndex),
                    ...stocks.slice(stockIndex + 1),
                ];
                await Stock.findByIdAndDelete(_id);
                await User.findByIdAndUpdate(req.user.userId, {
                    stocks: newStockList,
                });
            } else {
                const newHistoryList = [
                    ...history.slice(0, historyIndex),
                    ...history.slice(historyIndex + 1),
                ];
                const calculatedResults = getDeltaCount(newHistoryList);
                const profitData = getProfite(calculatedResults);
                if (profitData.error || calculatedResults.error) {
                    return return400(res, calculatedResults.error);
                }

                const { countRest, deltaBuy, deltaSell, allFee } =
                    calculatedResults;
                const updatedMainStock = {
                    status: countRest ? Status.active : Status.closed,
                    restCount: countRest,
                    deltaBuy,
                    deltaSell,
                    fee: allFee,
                    profit: profitData.profit,
                };

                await Stock.findByIdAndUpdate(_id, {
                    history: newHistoryList,
                    ...updatedMainStock,
                });
            }

            let sumPrice = 0;
            const freshUserData = await User.findById(req.user.userId).populate(
                {
                    path: 'stocks',
                },
            );
            freshUserData.stocks.forEach(({ deltaBuy, restCount }) => {
                sumPrice += deltaBuy * restCount;
            });

            const { count, pricePerSingle, fee } = currentHistoryItem;
            const newCash =
                currentHistoryItem.action === 'buy'
                    ? currentStock.broker.cash + (count * pricePerSingle + fee)
                    : currentStock.broker.cash - (count * pricePerSingle - fee);
            await Broker.findByIdAndUpdate(currentStock.broker._id, {
                cash: newCash,
                sumStocks: sumPrice,
                sumBalance: newCash + sumPrice,
            });

            return res.json({
                message: `The stock was removed`,
            });
        } catch (e) {
            res.status(500).json({ message: 'Something was wrong...' });
        }
    },
);

export = router;
