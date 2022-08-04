import { Router, Request, Response } from 'express';
import { check, validationResult } from 'express-validator';
import { Types } from 'mongoose';

import { User } from '../models/User';
import { IBroker, Broker } from '../models/Broker';
import { Currency } from '../models/Currency';
import { checkAuth } from '../middleware/auth.middleware';
import { return400 } from '../utils/return400';
import { returnValidationResult } from '../utils/returnValidationResult';

const router = Router();

// /api/broker
router.get('/', checkAuth, async (req: Request, res: Response) => {
    try {
        const result = await User.findById(req.user.userId).populate({
            path: 'brokerAccounts',
            populate: { path: 'currency' },
        });

        if (!result) {
            return return400(res, 'User not found');
        }

        return res.json({
            message: 'A broker account(s) has been find',
            brokerAccounts: result.brokerAccounts,
        });
    } catch (e) {
        res.status(500).json({ message: 'Something was wrong...' });
    }
});

// /api/broker
router.post(
    '/',
    [
        check('title', 'Title of broker is missing').isString().notEmpty(),
        check('currencyId', 'Currency id was not recived').notEmpty(),
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
                return return400(res, 'User not found');
            }

            if (!Types.ObjectId.isValid(currencyId)) {
                return return400(res, 'Currency id have wrong format');
            }
            const currency = await Currency.findById(currencyId);
            if (!currency) {
                return return400(res, 'Currency was not found');
            }

            const brokerData = {
                title,
                currency,
                cash,
                sumStokes: 0,
                sumBalance: cash,
                status: 'active',
            };

            const broker = new Broker(brokerData);
            broker.save().then(async ({ _id }) => {
                await User.findByIdAndUpdate(req.user.userId, {
                    $push: {
                        brokerAccounts: {
                            _id,
                            ...brokerData,
                        },
                    },
                });
            });

            return res.json({
                message: 'A broker account has been created',
                brokerData,
            });
        } catch (e) {
            res.status(500).json({ message: 'Something was wrong...' });
        }
    },
);

// /api/broker/remove
router.post(
    '/remove',
    [check('id', 'ID was not recived').notEmpty()],
    checkAuth,
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return returnValidationResult(res, errors);
            }

            const { id } = req.body;

            if (!Types.ObjectId.isValid(id)) {
                return return400(res, 'Broker id have wrong format');
            }

            const userData = await User.findById(req.user.userId);
            if (!userData) {
                return return400(res, 'User not found');
            }

            const recivedId = new Types.ObjectId(id);
            const removingResult = await Broker.findByIdAndDelete(recivedId);
            if (!removingResult) {
                return return400(res, 'Broker account not found');
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
                message: 'A broker account has been removed',
            });
        } catch (e) {
            res.status(500).json({ message: 'Something was wrong...' });
        }
    },
);

// /api/broker/correct
router.post(
    '/correct',
    [
        check('id', 'ID was not recived').notEmpty(),
        check('cash', 'cash sum was not recived').isFloat({ min: 0 }),
    ],
    checkAuth,
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return returnValidationResult(res, errors);
            }

            const { id, cash, status = 'active' } = req.body;

            if (status !== 'active' && status !== 'unactive') {
                return return400(res, 'Transferred status does not exist');
            }

            if (!Types.ObjectId.isValid(id)) {
                return return400(res, 'Broker id have wrong format');
            }

            const userData = await User.findById(req.user.userId).populate(
                'brokerAccounts',
            );
            if (!userData) {
                return return400(res, 'User not found');
            }

            let currentSumStokes = 0;
            let findIndex = -1;
            const recivedId = new Types.ObjectId(id);
            const { brokerAccounts } = userData;
            brokerAccounts.forEach((broker: IBroker, index) => {
                const { _id, sumStokes } = broker;
                if (String(_id) === String(recivedId)) {
                    currentSumStokes = sumStokes;
                    findIndex = index;
                }
            });
            if (findIndex === -1) {
                return return400(res, 'Broker account not found');
            }

            await Broker.findByIdAndUpdate(id, {
                cash,
                status,
                sumBalance: cash + currentSumStokes,
            });

            return res.json({
                message: 'A broker account cash or/and status was corrected',
            });
        } catch (e) {
            res.status(500).json({ message: 'Something was wrong...' });
        }
    },
);

export = router;
