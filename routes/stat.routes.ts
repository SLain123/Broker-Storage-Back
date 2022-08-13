import { Router, Request, Response } from 'express';
import { check, validationResult } from 'express-validator';

import { User } from '../models/User';
import { checkAuth } from '../middleware/auth.middleware';
import { return400 } from '../utils/return400';
import { returnValidationResult } from '../utils/returnValidationResult';

import { Error, Success, Val } from '../utils/getTexts';

const router = Router();

// /api/stat/fee
router.post(
    '/fee',
    [check('byYear', Val.wrongYear).optional().isInt({ min: 2000, max: 2100 })],
    checkAuth,
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return returnValidationResult(res, errors);
            }

            const userData = await User.findById(req.user.userId).populate([
                {
                    path: 'stocks',
                    populate: { path: 'broker', model: 'Broker' },
                },
                { path: 'stocks', populate: 'currency' },
            ]);
            if (!userData) {
                return return400(res, Error.userNotFound);
            }

            const { byYear } = req.body;
            const tempStore = {};
            userData.stocks.forEach(
                ({ broker, fee, currency, lastEditedDate }) => {
                    const { _id } = broker;

                    if (byYear) {
                        const year = lastEditedDate.getFullYear();
                        const keyName = `${_id}/${year}`;

                        if (
                            tempStore.hasOwnProperty(keyName) &&
                            byYear === year
                        ) {
                            tempStore[keyName].fee =
                                tempStore[keyName].fee + fee;
                        } else if (byYear === year) {
                            tempStore[keyName] = {
                                fee,
                                currency,
                                broker,
                                year,
                            };
                        }
                    } else {
                        if (tempStore.hasOwnProperty(_id)) {
                            tempStore[_id].fee = tempStore[_id].fee + fee;
                        } else {
                            tempStore[_id] = { fee, currency, broker };
                        }
                    }
                },
            );

            return res.json({
                message: Success.activeFound,
                result: Object.values(tempStore),
            });
        } catch (e) {
            res.status(500).json({ message: Error.somethingWrong });
        }
    },
);

export = router;
