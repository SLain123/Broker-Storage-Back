import { Router, Request, Response } from 'express';
import { check, validationResult } from 'express-validator';
import { Types } from 'mongoose';

import { User } from '../models/User';
import { IBroker, Broker } from '../models/Broker';
import { Currency } from '../models/Currency';
import { checkAuth } from '../middleware/auth.middleware';
import { return400 } from '../utils/return400';
import { returnValidationResult } from '../utils/returnValidationResult';
import { Error, Success, Val } from '../utils/getTexts';

const router = Router();

// /api/broker
router.get('/', checkAuth, async (req: Request, res: Response) => {
    try {
        const result = await User.findById(req.user.userId).populate({
            path: 'brokerAccounts',
            populate: { path: 'currency' },
        });

        if (!result) {
            return return400(res, Error.userNotFound);
        }

        return res.json({
            message: Success.brokerFound,
            brokerAccounts: result.brokerAccounts,
        });
    } catch (e) {
        res.status(500).json({ message: Error.somethingWrong });
    }
});

// /api/broker
router.post(
    '/',
    [
        check('title', Val.missingBrokerTitle).isString(),
        check('currencyId', Val.incorrectCurrencyId).custom((id) =>
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

            const { title, currencyId, cash = 0 } = req.body;

            const userData = await User.findById(req.user.userId);
            if (!userData) {
                return return400(res, Error.userNotFound);
            }

            const currency = await Currency.findById(currencyId);
            if (!currency) {
                return return400(res, Error.currencyNotFound);
            }

            const brokerData = {
                title,
                currency,
                cash,
                sumStocks: 0,
                sumBalance: cash,
                status: 'active',
            };

            const broker = new Broker(brokerData);
            broker.save().then(async ({ _id }) => {
                const brokerDataWithId = {
                    _id,
                    ...brokerData,
                };

                await User.findByIdAndUpdate(req.user.userId, {
                    $push: {
                        brokerAccounts: brokerDataWithId,
                    },
                });

                return res.json({
                    message: Success.createdBroker,
                    broker: brokerDataWithId,
                });
            });
        } catch (e) {
            res.status(500).json({ message: Error.somethingWrong });
        }
    },
);

// /api/broker/remove
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

            const userData = await User.findById(req.user.userId);
            if (!userData) {
                return return400(res, Error.userNotFound);
            }

            const recivedId = new Types.ObjectId(req.body.id);
            const removingResult = await Broker.findByIdAndDelete(recivedId);
            if (!removingResult) {
                return return400(res, Error.brokerNotFound);
            }

            let findIndex = -1;
            const { brokerAccounts } = userData;
            brokerAccounts.forEach(({ _id }, index) => {
                if (String(_id) === String(recivedId)) {
                    findIndex = index;
                }
            });
            if (findIndex !== -1) {
                const updateBrokerList = [
                    ...brokerAccounts.slice(0, findIndex),
                    ...brokerAccounts.slice(findIndex + 1),
                ];
                await User.findByIdAndUpdate(req.user.userId, {
                    brokerAccounts: updateBrokerList,
                });
            }

            return res.json({
                message: Success.removedBroker,
            });
        } catch (e) {
            res.status(500).json({ message: Error.somethingWrong });
        }
    },
);

// /api/broker/correct
router.post(
    '/correct',
    [
        check('id', Val.incorrectId).custom((id) => Types.ObjectId.isValid(id)),
        check('title', Val.incorrectTitle).optional().isString().notEmpty(),
        check('cash', Val.cashNotRecived).isFloat({ min: 0 }),
        check('currencyId', Val.incorrectCurrencyId).custom((id) =>
            Types.ObjectId.isValid(id),
        ),
        check('status', Val.incorrectStatus)
            .optional()
            .custom((status) => status === 'active' || status === 'inactive'),
    ],
    checkAuth,
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return returnValidationResult(res, errors);
            }

            const { id, title, cash, status = 'active', currencyId } = req.body;

            const userData = await User.findById(req.user.userId).populate(
                'brokerAccounts',
            );
            if (!userData) {
                return return400(res, Error.userNotFound);
            }

            const currency = await Currency.findById(currencyId);
            if (!currency) {
                return return400(res, Error.currencyNotFound);
            }

            let currentSumStocks = 0;
            let oldTitle = '';
            let findIndex = -1;
            const recivedId = new Types.ObjectId(id);
            const { brokerAccounts } = userData;
            brokerAccounts.forEach((broker: IBroker, index) => {
                const { _id, title, sumStocks } = broker;
                if (String(_id) === String(recivedId)) {
                    currentSumStocks = sumStocks;
                    findIndex = index;
                    oldTitle = title;
                }
            });
            if (findIndex === -1) {
                return return400(res, Error.brokerNotFound);
            }

            await Broker.findByIdAndUpdate(id, {
                title: title ? title : oldTitle,
                cash,
                status,
                sumBalance: Number(cash) + Number(currentSumStocks),
                currency,
            });

            return res.json({
                message: Success.brokerChanged,
            });
        } catch (e) {
            res.status(500).json({ message: Error.somethingWrong });
        }
    },
);

export = router;
