import { Router } from 'express';
import { return400 } from '../utils/return400';
import { Currency } from '../models/Currency';

const router = Router();

// /api/currency
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

export = router;
