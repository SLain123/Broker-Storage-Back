import * as mongoose from 'mongoose';
import { Router } from 'express';
import { User, IBroker } from '../models/User';
import { check, validationResult } from 'express-validator';
import { checkAuth } from '../middleware/auth.middleware';
import { return400 } from '../utils/return400';
import { returnValidationResult } from '../utils/returnValidationResult';

const router = Router();

// /api/broker
router.get('/', checkAuth, async (req, res) => {
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
        check('currency', 'Currency was not recived').notEmpty(),
    ],
    checkAuth,
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return returnValidationResult(res, errors);
            }

            const { title, currency, cash = 0 } = req.body;

            if (!currency._id || !currency.title || !currency.ticker) {
                return return400(res, 'Currency have wrong format');
            }

            const result = await User.findByIdAndUpdate(req.user.userId, {
                $push: {
                    brokerAccounts: {
                        title,
                        currency,
                        cash,
                        sumStokes: 0,
                        sumBalance: cash,
                        status: 'active',
                    },
                },
            });
            if (!result) {
                return return400(res, 'User not found');
            }

            return res.json({ message: 'A broker account has been created' });
        } catch (e) {
            res.status(500).json({ message: 'Something was wrong...' });
        }
    },
);

// /api/broker/remove
router.post(
    '/remove',
    [check('_id', 'ID was not recived').isString().notEmpty()],
    checkAuth,
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return returnValidationResult(res, errors);
            }

            const { _id } = req.body;
            // check on valid broker id and user;
            if (_id.length !== 24 && _id.length !== 12) {
                return return400(res, 'Broker account not found');
            }
            let isExistedBroker = false;
            const recivedId = new mongoose.mongo.ObjectId(_id);
            const userData = await User.findById(req.user.userId);
            if (!userData) {
                return return400(res, 'User not found');
            }
            userData.brokerAccounts.forEach(({ _id }) => {
                if (String(_id) === String(recivedId)) {
                    isExistedBroker = true;
                }
            });
            if (!isExistedBroker) {
                return return400(res, 'Broker account not found');
            }

            await User.findByIdAndUpdate(req.user.userId, {
                $pull: {
                    brokerAccounts: { _id },
                },
            });
            return res.json({ message: 'A broker account has been removed' });
        } catch (e) {
            res.status(500).json({ message: 'Something was wrong...' });
        }
    },
);

// /api/broker/correct
router.post(
    '/correct',
    [
        check('_id', 'ID was not recived').isString().notEmpty(),
        check('cash', 'cash sum was not recived').isFloat({ min: 0 }),
    ],
    checkAuth,
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return returnValidationResult(res, errors);
            }

            const { _id, cash, status = 'active' } = req.body;
            if (status !== 'active' && status !== 'unactive') {
                return return400(res, 'Transferred status does not exist');
            }
            // check on valid broker id and user;
            if (_id.length !== 24 && _id.length !== 12) {
                return return400(res, 'Broker accound not found');
            }
            let isExistedBroker = false;
            let currentBroker = null;
            let findIndex = 0;
            const recivedId = new mongoose.mongo.ObjectId(_id);
            const userData = await User.findById(req.user.userId);
            if (!userData) {
                return return400(res, 'User not found');
            }
            const { brokerAccounts } = userData;
            brokerAccounts.forEach((broker: IBroker, index) => {
                const { _id, title, currency, sumStokes } = broker;
                if (String(_id) === String(recivedId)) {
                    isExistedBroker = true;
                    currentBroker = {
                        _id,
                        title,
                        currency,
                        cash,
                        sumStokes,
                        sumBalance: sumStokes + cash,
                        status,
                    };
                    findIndex = index;
                }
            });
            if (!isExistedBroker) {
                return return400(res, 'Broker account not found');
            }
            const updateBrokerList = [
                ...brokerAccounts.slice(0, findIndex),
                currentBroker,
                ...brokerAccounts.slice(findIndex + 1),
            ];

            await User.findByIdAndUpdate(req.user.userId, {
                brokerAccounts: updateBrokerList,
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
