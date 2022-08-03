import { Router } from 'express';
import { check, validationResult } from 'express-validator';

import { User } from '../models/User';
import { checkAuth } from '../middleware/auth.middleware';
import { return400 } from '../utils/return400';
import { returnValidationResult } from '../utils/returnValidationResult';

const router = Router();

// /api/profile
router.get('/', checkAuth, async (req, res) => {
    try {
        const result = await User.findById(req.user.userId)
            .populate('defaultCurrency')
            .populate({
                path: 'brokerAccounts',
                populate: { path: 'currency' },
            });
        if (!result) {
            return return400(res, 'User not found');
        }

        const { nickName, avatar, defaultCurrency, brokerAccounts } = result;

        return res.json({
            message: 'User found',
            nickName,
            avatar,
            defaultCurrency,
            brokerAccounts,
        });
    } catch (e) {
        res.status(500).json({ message: 'Something was wrong...' });
    }
});

// /api/profile
router.post(
    '/',
    [check('nickName', 'User nick name is missing').isString().notEmpty()],
    checkAuth,
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return returnValidationResult(res, errors);
            }

            const { nickName } = req.body;

            const result = await User.findByIdAndUpdate(req.user.userId, {
                nickName,
            });
            if (!result) {
                return return400(res, 'User not found');
            }

            return res.json({ message: 'User data has been changed' });
        } catch (e) {
            res.status(500).json({ message: 'Something was wrong...' });
        }
    },
);

// /api/profile/avatar
router.post(
    '/avatar',
    [check('avatar', 'Avatar must be base64 format').isBase64()],
    checkAuth,
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return returnValidationResult(res, errors);
            }

            const { avatar } = req.body;

            const result = await User.findByIdAndUpdate(req.user.userId, {
                avatar,
            });
            if (!result) {
                return return400(res, 'User not found');
            }

            return res.json({ message: 'User data has been changed' });
        } catch (e) {
            res.status(500).json({ message: 'Something was wrong...' });
        }
    },
);

export = router;
