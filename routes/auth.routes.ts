import { Router, Request, Response } from 'express';
import { check, validationResult } from 'express-validator';
import { Types } from 'mongoose';
import { hash, compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';

import { User } from '../models/User';
import { Currency } from '../models/Currency';
import { checkAuth } from '../middleware/auth.middleware';
import { return400 } from '../utils/return400';
import { returnValidationResult } from '../utils/returnValidationResult';
import { Error, Success, Val } from '../utils/getTexts';

const router = Router();

// /api/auth/register
router.post(
    '/register',
    [
        check('email', Val.wrongEmail).isEmail(),
        check('password', Val.incorrectPassword).isLength({
            min: 6,
        }),
        check('nickName', Val.missingNick).isString(),
        check('defaultCurrencyId', Val.incorrectDefCurrencyId).custom((id) =>
            Types.ObjectId.isValid(id),
        ),
    ],
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return returnValidationResult(res, errors);
            }

            const { email, password, nickName, defaultCurrencyId } = req.body;

            const candidateByMail = await User.findOne({ email });
            if (candidateByMail) {
                return return400(res, Error.alreadyExistsUser);
            }

            const currency = await Currency.findById(defaultCurrencyId);
            const hashedPassword = await hash(password, 11);
            const user = new User({
                email,
                password: hashedPassword,
                nickName,
                avatar: null,
                role: 'user',
                defaultCurrency: currency,
                brokerAccounts: [],
                stocks: [],
                relatedPayments: [],
            });
            await user.save();

            res.status(201).json({ message: Success.userCreate });
        } catch (e) {
            res.status(500).json({ message: Error.somethingWrong });
        }
    },
);

// /api/auth/login
router.post(
    '/login',
    [
        check('email', Val.incorrectEmail).isEmail(),
        check('password', Val.emptyPassword).exists(),
    ],
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return returnValidationResult(res, errors);
            }

            const { email, password } = req.body;

            const user = await User.findOne({ email });
            if (!user) {
                return return400(res, Error.unexistedUser);
            }

            const isMatch = await compare(password, user?.password);
            if (!isMatch) {
                return return400(res, Error.incorrectPassword);
            }

            const token = sign({ userId: user.id }, process.env.JWT_SECRET, {
                expiresIn: '10d',
            });

            res.json({
                token,
                userId: user.id,
                message: Success.success,
            });
        } catch (e) {
            res.status(500).json({ message: Error.somethingWrong });
        }
    },
);

// /api/auth/check
router.get('/check', checkAuth, async (req: Request, res: Response) => {
    try {
        if (req.user.userId) {
            return res.json({ message: Success.tokenOk, validate: true });
        } else {
            return res.json({ message: Error.incorrectToker, validate: false });
        }
    } catch (e) {
        res.status(500).json({ message: Error.somethingWrong });
    }
});

export = router;
