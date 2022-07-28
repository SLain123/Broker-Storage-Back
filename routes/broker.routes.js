const { Router } = require('express');
const User = require('../models/User');
const { check, validationResult } = require('express-validator');
const router = Router();
const auth = require('../middleware/auth.middleware');

// /api/broker/add
router.post(
    '/add',
    [
        check('title', 'Title of broker is missing').notEmpty(),
        check('currency', 'Currency was not recived').notEmpty(),
    ],
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

            const { title, currency, cash = 0 } = req.body;

            if (!currency._id || !currency.title || !currency.ticker) {
                return res.status(400).json({
                    errors: [
                        {
                            msg: 'Currency have wrong format',
                            value: currency,
                            param: 'currency',
                        },
                    ],
                });
            }

            const resultUser = await User.findByIdAndUpdate(req.user.userId, {
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

            if (!resultUser) {
                return res.status(400).json({
                    errors: [
                        {
                            msg: 'User not found',
                        },
                    ],
                });
            }

            return res.json({ message: 'A broker account has been created' });
        } catch (e) {
            res.status(500).json({ message: 'Something was wrong...' });
        }
    },
);

module.exports = router;
