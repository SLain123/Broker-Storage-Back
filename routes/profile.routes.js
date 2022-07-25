const { Router } = require('express');
const User = require('../models/User');
const { check, validationResult } = require('express-validator');
const router = Router();
const auth = require('../middleware/auth.middleware');

// /api/profile
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.user.userId });

        if (!user) {
            return res.status(400).json({
                errors: [
                    {
                        msg: 'User not found',
                    },
                ],
            });
        }

        const { nickName, avatar } = user;
        return res.json({
            message: 'User found',
            nickName,
            avatar,
        });
    } catch (e) {
        res.status(500).json({ message: 'Something was wrong...' });
    }
});

// /api/profile
router.post(
    '/',
    [check('nickName', 'User nick name is missing').notEmpty()],
    auth,
    async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'Data uncorrect!',
                });
            }

            const { nickName } = req.body;
            const resultUser = await User.findOneAndUpdate(
                { _id: req.user.userId },
                { nickName },
            );

            if (!resultUser) {
                return res.status(400).json({
                    errors: [
                        {
                            msg: 'User not found',
                        },
                    ],
                });
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
    [check('avatar', 'Avatar must be base64 format').notEmpty()],
    auth,
    async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'Data uncorrect!',
                });
            }

            const { avatar } = req.body;
            const result = await User.findOneAndUpdate(
                { _id: req.user.userId },
                { avatar },
            );

            if (!result) {
                return res.status(400).json({
                    errors: [
                        {
                            msg: 'User not found',
                        },
                    ],
                });
            }

            return res.json({ message: 'User data has been changed' });
        } catch (e) {
            res.status(500).json({ message: 'Something was wrong...' });
        }
    },
);

module.exports = router;
