const { Router } = require('express');
const Currency = require('../models/Currency');
const router = Router();
const return400 = require('../utils/return400');

// /api/tools/currency
router.get('/', async (_req, res) => {
    try {
        const currencies = await Currency.find();

        if (!currencies.length) {
            return return400(res, 'No currency exists');
        }

        res.json({ message: 'Success!', currencies });
    } catch (e) {
        res.status(500).json({ message: 'Something was wrong...' });
    }
});

module.exports = router;
