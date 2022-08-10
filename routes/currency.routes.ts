import { Router, Request, Response } from 'express';

import { return400 } from '../utils/return400';
import { Currency } from '../models/Currency';
import { Error, Success } from '../utils/getTexts';

const router = Router();

// /api/currency
router.get('/', async (_req: Request, res: Response) => {
    try {
        const currencies = await Currency.find();

        if (!currencies.length) {
            return return400(res, Error.unexistedCurrency);
        }

        res.json({ message: Success.success, currencies });
    } catch (e) {
        res.status(500).json({ message: Error.somethingWrong });
    }
});

export = router;
