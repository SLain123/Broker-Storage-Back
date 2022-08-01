import { Router } from 'express';
import { User } from '../models/User';
import { hash, compare } from 'bcrypt';
import { check, validationResult } from 'express-validator';
import { sign } from 'jsonwebtoken';
import { checkAuth } from '../middleware/auth.middleware';
import { return400 } from '../utils/return400';
import { returnValidationResult } from '../utils/returnValidationResult';

const router = Router();

// /api/auth/register
router.post(
    '/register',
    [
        check('email', 'Wrong email format').isEmail(),
        check('password', 'Uncorrect password, minimum 6 symbols').isLength({
            min: 6,
        }),
        check('nickName', 'User nick name is missing').isString().notEmpty(),
        check('defaultCurrency', 'Default currency was not recived').notEmpty(),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return returnValidationResult(res, errors);
            }

            const { email, password, nickName, defaultCurrency } = req.body;

            const candidateByMail = await User.findOne({ email });
            if (candidateByMail) {
                return return400(res, 'User email already exists!');
            }

            if (
                !defaultCurrency._id ||
                !defaultCurrency.title ||
                !defaultCurrency.ticker
            ) {
                return return400(res, 'Currency have wrong format');
            }

            const hashedPassword = await hash(password, 11);
            const user = new User({
                email,
                password: hashedPassword,
                nickName,
                avatar: null,
                role: 'user',
                defaultCurrency,
                brokerAccounts: [],
                stoсks: [],
                relatedPayments: [],
            });
            await user.save();

            res.status(201).json({ message: 'User was create!' });
        } catch (e) {
            res.status(500).json({ message: 'Something was wrong...' });
        }
    },
);

// /api/auth/login
router.post(
    '/login',
    [
        check('email', 'Type correct email').isEmail(),
        check('password', 'Type password').exists(),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return returnValidationResult(res, errors);
            }

            const { email, password } = req.body;

            const user = await User.findOne({ email });
            if (!user) {
                return return400(res, "User doesn't exist!");
            }

            const isMatch = await compare(password, user?.password);
            if (!isMatch) {
                return return400(res, 'Password incorrect!');
            }

            const token = sign({ userId: user.id }, process.env.JWT_SECRET, {
                expiresIn: '10d',
            });

            res.json({
                token,
                userId: user.id,
                message: 'Success!',
            });
        } catch (e) {
            res.status(500).json({ message: 'Something was wrong...' });
        }
    },
);

// /api/auth/check
router.get('/check', checkAuth, async (req, res) => {
    try {
        if (req.user.userId) {
            return res.json({ message: 'Token correct', validate: true });
        } else {
            return res.json({ message: 'Token uncorrect', validate: false });
        }
    } catch (e) {
        res.status(500).json({ message: 'Something was wrong...' });
    }
});

export = router;
