import { Router } from 'express';
import { check, validationResult } from 'express-validator';
import { Types } from 'mongoose';

import { User } from '../models/User';
import { IBroker, Broker } from '../models/Broker';
import { Stock } from '../models/Stock';
import { checkAuth } from '../middleware/auth.middleware';
import { return400 } from '../utils/return400';
import { returnValidationResult } from '../utils/returnValidationResult';

const router = Router();

// /api/stock/all
router.get('/all', checkAuth, async (req, res) => {
    try {
        const result = await User.findById(req.user.userId).populate([
            {
                path: 'stoсks',
                populate: { path: 'broker', populate: { path: 'currency' } },
            },
            { path: 'stoсks', populate: 'currency' },
        ]);

        if (!result) {
            return return400(res, 'User not found');
        }
        const { stoсks } = result;

        return res.json({
            message: 'Stoсks were found',
            stoсks,
        });
    } catch (e) {
        res.status(500).json({ message: 'Something was wrong...' });
    }
});

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
        check('brokerId', 'Broker id was not recived').notEmpty(),
        check('type', 'Type of stock was not recived')
            .exists()
            .custom(
                (value) =>
                    value === 'stock' ||
                    value === 'bond' ||
                    value === 'futures',
            ),
    ],
    checkAuth,
    async (req, res) => {
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

            if (!Types.ObjectId.isValid(brokerId)) {
                return return400(res, 'Wrong broker id format');
            }

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
                })

                await User.findByIdAndUpdate(req.user.userId, {
                    $push: {
                        stoсks: {
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

export = router;
