const { Router } = require('express');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const router = Router();
const auth = require('../middleware/auth.middleware');
const return400 = require('../utils/return400');
const returnValidationResult = require('../utils/returnValidationResult');

// /api/auth/register
router.post(
    '/register',
    [
        check('email', 'Wrong email format').isEmail(),
        check('password', 'Uncorrect password, minimum 6 symbols').isLength({
            min: 6,
        }),
        check('nickName', 'User nick name is missing').notEmpty(),
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

            const hashedPassword = await bcrypt.hash(password, 11);
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

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return return400(res, 'Password incorrect!');
            }

            const token = jwt.sign(
                { userId: user.id },
                process.env.JWT_SECRET,
                {
                    expiresIn: '10d',
                },
            );

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
router.get('/check', auth, async (req, res) => {
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

module.exports = router;
