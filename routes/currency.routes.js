const { Router } = require('express');
const Currency = require('../models/Currency');
const router = Router();

// /api/tools/currency
router.get('/currency', async (_req, res) => {
    try {
        const currencies = await Currency.find();

        if (!currencies.length) {
            return res.status(400).json({
                errors: [
                    {
                        msg: 'No currency exists',
                    },
                ],
            });
        }

        res.json({ message: 'Success!', currencies });
    } catch (e) {
        res.status(500).json({ message: 'Something was wrong...' });
    }
});

module.exports = router;
