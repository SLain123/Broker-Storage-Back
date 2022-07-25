const { Router } = require('express');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const router = Router();
const auth = require('../middleware/auth.middleware');

// /api/auth/register
router.post(
    '/register',
    [
        check('email', 'Wrong email format').isEmail(),
        check('password', 'Uncorrect password, minimum 6 symbols').isLength({
            min: 6,
        }),
        check('nickName', 'User nick name is missing').notEmpty(),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'Data uncorrect!',
                });
            }

            const { email, password, nickName } = req.body;
            const candidateByMail = await User.findOne({ email });
            const candidateByNick = await User.findOne({ nickName });

            if (candidateByMail || candidateByNick) {
                candidateByMail &&
                    res.status(400).json({
                        errors: [
                            {
                                msg: 'User email already exists!',
                                value: email,
                                param: 'email',
                            },
                        ],
                    });

                candidateByNick &&
                    res.status(400).json({
                        errors: [
                            {
                                msg: 'User nick already exists!',
                                value: nickName,
                                param: 'nickName',
                            },
                        ],
                    });
            }

            const hashedPassword = await bcrypt.hash(password, 11);
            const user = new User({
                email,
                password: hashedPassword,
                nickName,
                avatar: null,
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
        res.setHeader('Access-Control-Allow-Credentials', true);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader(
            'Access-Control-Allow-Methods',
            'GET,OPTIONS,PATCH,DELETE,POST,PUT',
        );
        res.setHeader(
            'Access-Control-Allow-Headers',
            'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
        );

        if (req.method === 'OPTIONS') {
            res.status(200).end();
            return;
        }
        
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'Data uncorrect!',
                });
            }

            const { email, password } = req.body;

            const user = await User.findOne({ email });

            if (!user) {
                return res.status(400).json({
                    errors: [
                        {
                            msg: "User doesn't exist!",
                            value: email,
                            param: 'email',
                        },
                    ],
                });
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(400).json({
                    errors: [
                        {
                            msg: 'Password incorrect!',
                            value: email,
                            param: 'email',
                        },
                    ],
                });
            }

            const token = jwt.sign(
                { userId: user.id },
                process.env.JWT_SECRET,
                {
                    expiresIn: '1d',
                },
            );

            res.json({ token, userId: user.id, message: 'Success!' });
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
