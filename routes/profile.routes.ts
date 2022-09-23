import { Router, Request, Response } from 'express';
import { check, validationResult } from 'express-validator';
import { Types } from 'mongoose';

import { Currency } from '../models/Currency';
import { User } from '../models/User';
import { checkAuth } from '../middleware/auth.middleware';
import { return400 } from '../utils/return400';
import { returnValidationResult } from '../utils/returnValidationResult';
import { Error, Success, Val } from '../utils/getTexts';

const router = Router();

// /api/profile
router.get('/', checkAuth, async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.user.userId)
            .populate('defaultCurrency')
            .populate({
                path: 'brokerAccounts',
                populate: { path: 'currency' },
            });
        if (!user) {
            return return400(res, Error.userNotFound);
        }

        const {
            email,
            nickName,
            defaultCurrency,
            role,
            avatar,
            brokerAccounts,
        } = user;

        return res.json({
            message: Success.userFound,
            user: {
                email,
                nickName,
                defaultCurrency,
                role,
                avatar,
                brokerAccounts,
            },
        });
    } catch (e) {
        res.status(500).json({ message: Error.somethingWrong });
    }
});

// /api/profile
router.post(
    '/',
    [
        check('nickName', Val.missingNick).isString(),
        check('defaultCurrencyId', Val.incorrectDefCurrencyId).custom((id) =>
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

            const { nickName, defaultCurrencyId } = req.body;
            const currency = await Currency.findById(defaultCurrencyId);
            if (!currency) {
                return return400(res, Error.currencyNotFound);
            }

            const result = await User.findByIdAndUpdate(req.user.userId, {
                nickName,
                defaultCurrency: currency,
            });
            if (!result) {
                return return400(res, Error.userNotFound);
            }

            return res.json({ message: Success.userChanged });
        } catch (e) {
            res.status(500).json({ message: Error.somethingWrong });
        }
    },
);

// /api/profile/avatar
router.post(
    '/avatar',
    [check('avatar', Val.wrongAvatar).isBase64()],
    checkAuth,
    async (req: Request, res: Response) => {
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
                return return400(res, Error.userNotFound);
            }

            return res.json({ message: Success.userChanged });
        } catch (e) {
            res.status(500).json({ message: Error.somethingWrong });
        }
    },
);

export = router;
