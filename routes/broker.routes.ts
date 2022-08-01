import * as mongoose from 'mongoose';
import { Router } from 'express';
import { User } from '../models/User';
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
        check('title', 'Title of broker is missing').notEmpty(),
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
    [check('_id', 'ID was not recived').notEmpty()],
    checkAuth,
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return returnValidationResult(res, errors);
            }

            // check on valid broker id and user;
            if (req.body._id.length !== 24 && req.body._id.length !== 12) {
                return return400(res, 'Broker accound not found');
            }
            let isExistedBroker = false;
            const recivedId = new mongoose.mongo.ObjectId(req.body._id);
            const brokerList = await User.findById(req.user.userId);
            if (!brokerList) {
                return return400(res, 'User not found');
            }
            brokerList.brokerAccounts.forEach(({ _id }) => {
                if (String(_id) === String(recivedId)) {
                    isExistedBroker = true;
                }
            });
            if (!isExistedBroker) {
                return return400(res, 'Broker accound not found');
            }

            await User.findByIdAndUpdate(req.user.userId, {
                $pull: {
                    brokerAccounts: { _id: req.body._id },
                },
            });
            return res.json({ message: 'A broker account has been removed' });
        } catch (e) {
            res.status(500).json({ message: 'Something was wrong...' });
        }
    },
);

export = router;
