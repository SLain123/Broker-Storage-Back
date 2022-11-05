import { Router, Request, Response } from 'express';
import { check, validationResult } from 'express-validator';
import { Types } from 'mongoose';

import { User } from '../models/User';
import { IBroker, Broker, IBrokerData } from '../models/Broker';
import { Stock, IStock, Status, StockType } from '../models/Stock';
import { IHistory, StockHistory, IHistoryData } from '../models/StockHistory';
import { checkAuth } from '../middleware/auth.middleware';
import { return400 } from '../utils/return400';
import { returnValidationResult } from '../utils/returnValidationResult';
import { getProfite } from './../utils/getProfit';
import { getDeltaCount } from './../utils/getDeltaCount';
import { Error, Success, Val } from '../utils/getTexts';

const router = Router();

// /api/stock
router.post(
    '/',
    [check('id', Val.incorrectId).custom((id) => Types.ObjectId.isValid(id))],
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
                { path: 'stocks', populate: { path: 'currency' } },
                {
                    path: 'stocks',
                    populate: { path: 'history', model: 'Stock_History' },
                },
                {
                    path: 'stocks',
                    populate: { path: 'dividends', model: 'Dividend' },
                },
            ]);

            if (!result) {
                return return400(res, Error.userNotFound);
            }
            const { stocks } = result;
            const stock = stocks.filter(
                ({ _id }) =>
                    String(new Types.ObjectId(req.body.id)) ===
                    String(new Types.ObjectId(_id)),
            );

            if (stock.length < 1) {
                return return400(res, Error.stockNotFound);
            }

            return res.json({
                message: Success.stockFound,
                stock: stock[0],
            });
        } catch (e) {
            res.status(500).json({ message: Error.somethingWrong });
        }
    },
);

// /api/stock/all
router.post(
    '/all',
    [
        check('filters', Val.incorrectFilters)
            .optional()
            .isObject()
            .custom(
                (obj: Object) =>
                    obj.hasOwnProperty('brokerId') ||
                    obj.hasOwnProperty('currencyId') ||
                    obj.hasOwnProperty('year') ||
                    obj.hasOwnProperty('status') ||
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
                { path: 'stocks', populate: { path: 'currency' } },
            ]);
            console.log(result);
            if (!result) {
                return return400(res, Error.userNotFound);
            }
            const { filters } = req.body;
            let { stocks } = result;

            if (filters) {
                if (filters.hasOwnProperty('brokerId')) {
                    const { brokerId } = filters;
                    if (!Types.ObjectId.isValid(brokerId)) {
                        return return400(res, Error.wrongBrokerId);
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
                        return return400(res, Error.wrongCurrencyId);
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
                        return return400(res, Error.wrongYear);
                    } else {
                        stocks = stocks.filter(({ lastEditedDate }) => {
                            return lastEditedDate.getFullYear() === +year;
                        });
                    }
                }

                if (filters.hasOwnProperty('status')) {
                    const { status: stat } = filters;
                    if (stat !== 'active' && stat !== 'closed') {
                        return return400(res, Error.wrongStatus);
                    } else {
                        stocks = stocks.filter(({ status }) => stat === status);
                    }
                }

                if (filters.hasOwnProperty('type')) {
                    const { type: filterType } = filters;
                    if (
                        filterType !== StockType.stock &&
                        filterType !== StockType.bond &&
                        filterType !== StockType.futures &&
                        filterType !== StockType.currency
                    ) {
                        return return400(res, Error.wrongType);
                    } else {
                        stocks = stocks.filter(
                            ({ type }) => type === filterType,
                        );
                    }
                }
            }

            return res.json({
                message: Success.stocksFound,
                stocks,
            });
        } catch (e) {
            res.status(500).json({ message: Error.somethingWrong });
        }
    },
);

// /api/stock/create
router.post(
    '/create',
    [
        check('date', Val.missingDate).isDate(),
        check('title', Val.missingStockTitle).isString(),
        check('count', Val.missingCount).isInt({
            min: 0,
        }),
        check('pricePerSingle', Val.missingSinglePrice).isFloat({ min: 0 }),
        check('fee', Val.missingFee).isFloat({ min: 0 }),
        check('brokerId', Val.incorrectBrokerId).custom((id) =>
            Types.ObjectId.isValid(id),
        ),
        check('type', Val.missingType).custom(
            (type) =>
                type === StockType.stock ||
                type === StockType.bond ||
                type === StockType.futures ||
                type === StockType.currency,
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
                return return400(res, Error.userNotFound);
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
                return return400(res, Error.notEnoughtCash);
            }
            if (!currentBroker || currentBroker.status !== 'active') {
                return return400(res, Error.brokerNotFound);
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
                        message: Success.stockCreated,
                        stock,
                    });
                });
            });
        } catch (e) {
            res.status(500).json({ message: Error.somethingWrong });
        }
    },
);

// /api/stock/add
router.post(
    '/add',
    [
        check('id', Val.incorrectId).custom((id) => Types.ObjectId.isValid(id)),
        check('date', Val.missingDate).isDate(),
        check('count', Val.missingCount).isInt({
            min: 0,
        }),
        check('pricePerSingle', Val.missingSinglePrice).isFloat({ min: 0 }),
        check('fee', Val.missingFee).isFloat({ min: 0 }),
        check('action', Val.missingAction).custom(
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
                return return400(res, Error.userNotFound);
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
                return return400(res, Error.unexistedStock);
            }

            if (currentStock.broker.status !== 'active') {
                return return400(res, Error.inactiveBroker);
            }
            if (currentStock.broker.cash < sumBuyCost && action === 'buy') {
                return return400(res, Error.notEnoughtCash);
            }
            if (currentStock.status !== Status.active) {
                return return400(res, Error.inactiveStock);
            }

            const historyData: IHistoryData = {
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

                const newCash =
                    action === 'buy'
                        ? currentStock.broker.cash - sumBuyCost
                        : currentStock.broker.cash + sumSellCost;
                const newSumStock =
                    action === 'buy'
                        ? currentStock.broker.sumStocks +
                          (count * pricePerSingle + fee)
                        : currentStock.broker.sumStocks -
                          (count * pricePerSingle + fee);

                await Broker.findByIdAndUpdate(currentStock.broker._id, {
                    cash: newCash,
                    sumStocks: newSumStock,
                    sumBalance: newCash + newSumStock,
                });
            });

            return res.json({
                message: `Action <${action}> was added in stock history`,
            });
        } catch (e) {
            res.status(500).json({ message: Error.somethingWrong });
        }
    },
);

// /api/stock/remove
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
                    populate: { path: 'history', model: 'Stock_History' },
                },
                {
                    path: 'stocks',
                    populate: { path: 'broker' },
                },
            ]);
            if (!userData) {
                return return400(res, Error.userNotFound);
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
                return return400(res, Error.unexistedStock);
            }

            const { _id, broker, history } = currentStock;
            if (broker.status !== 'active') {
                return return400(res, Error.inactiveBroker);
            }
            if (historyIndex === 0 && history.length > 1) {
                return return400(res, Error.firstStockCantBeDeleted);
            }

            const removedHistoryItem = await StockHistory.findByIdAndDelete(
                req.body.id,
            );
            if (!removedHistoryItem) {
                return return400(res, Error.historyStockNotFound);
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

            const { count, pricePerSingle, fee } = currentHistoryItem;
            const newCash =
                currentHistoryItem.action === 'buy'
                    ? currentStock.broker.cash + (count * pricePerSingle + fee)
                    : currentStock.broker.cash - (count * pricePerSingle - fee);
            const newSumStock =
                currentHistoryItem.action === 'buy'
                    ? currentStock.broker.sumStocks -
                      (count * pricePerSingle + fee)
                    : currentStock.broker.sumStocks +
                      (count * pricePerSingle + fee);

            await Broker.findByIdAndUpdate(currentStock.broker._id, {
                cash: newCash,
                sumStocks: newSumStock,
                sumBalance: newCash + newSumStock,
            });

            return res.json({
                message: Success.stockRemoved,
            });
        } catch (e) {
            res.status(500).json({ message: Error.somethingWrong });
        }
    },
);

export = router;
