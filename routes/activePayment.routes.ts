import { Router, Request, Response } from 'express';
import { check, validationResult } from 'express-validator';
import { Types } from 'mongoose';

import { User } from '../models/User';
import { Dividend } from '../models/Dividend';
import { Active, IActive, Status } from '../models/Active';
import { checkAuth } from '../middleware/auth.middleware';
import { return400 } from '../utils/return400';
import { returnValidationResult } from '../utils/returnValidationResult';

import { Error, Success, Val } from '../utils/getTexts';

const router = Router();

// /api/active/pay/create
router.post(
    '/create',
    [
        check('activeId', Val.incorrectId).custom((id) =>
            Types.ObjectId.isValid(id),
        ),
        check('date', Val.missingDate).isDate(),
        check('payment', Val.missingPayment).isFloat({ min: 0 }),
    ],
    checkAuth,
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return returnValidationResult(res, errors);
            }

            const { activeId, date, payment } = req.body;

            const userData = await User.findById(req.user.userId).populate({
                path: 'actives',
                populate: 'currency',
            });
            if (!userData) {
                return return400(res, Error.userNotFound);
            }

            let currentActive: IActive = null;
            userData.actives.forEach((act) => {
                if (String(act._id) === String(new Types.ObjectId(activeId))) {
                    currentActive = act;
                }
            });
            if (!currentActive) {
                return return400(res, Error.unexistedActive);
            }

            const { currency, cash, status } = currentActive;
            if (status !== Status.active) {
                return return400(res, Error.inactiveActive);
            }

            const dividendDate = {
                date: new Date(date),
                currency,
                sumPriceBuyngStoсk: cash,
                payment,
            };

            const dividend = new Dividend(dividendDate);
            dividend.save().then(async ({ _id }) => {
                await Active.findByIdAndUpdate(activeId, {
                    cash: cash + payment,
                    $push: {
                        dividends: {
                            _id,
                            ...dividendDate,
                        },
                    },
                });

                return res.json({
                    message: Success.dividendCreated,
                    payment: { _id, ...dividendDate },
                });
            });
        } catch (e) {
            res.status(500).json({ message: Error.somethingWrong });
        }
    },
);

// /api/active/pay/remove
router.post(
    '/remove',
    [check('id', Val.incorrectId).custom((id) => Types.ObjectId.isValid(id))],
    checkAuth,
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return returnValidationResult(res, errors);
            }

            const userData = await User.findById(req.user.userId).populate([
                {
                    path: 'actives',
                    populate: { path: 'dividends', model: 'Dividend' },
                },
            ]);
            if (!userData) {
                return return400(res, Error.userNotFound);
            }

            let currentActive: IActive = null;
            let divIndex = -1;
            let removingPayment = 0;
            userData.actives.forEach((act) => {
                act.dividends.forEach((divItem, index) => {
                    if (
                        String(req.body.id) ===
                        String(new Types.ObjectId(divItem._id))
                    ) {
                        currentActive = act;
                        divIndex = index;
                        removingPayment = divItem.payment;
                    }
                });
            });
            if (divIndex === -1) {
                return return400(res, Error.divNotFound);
            }

            const { _id, dividends, cash } = currentActive;
            const newDivList = [
                ...dividends.slice(0, divIndex),
                ...dividends.slice(divIndex + 1),
            ];
            await Dividend.findByIdAndRemove(req.body.id);
            await Active.findByIdAndUpdate(_id, {
                dividends: newDivList,
                cash: cash - removingPayment,
            });

            return res.json({
                message: Success.dividendRemoved,
            });
        } catch (e) {
            res.status(500).json({ message: Error.somethingWrong });
        }
    },
);

export = router;
