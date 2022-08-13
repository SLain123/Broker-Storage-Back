import { Router, Request, Response } from 'express';
import { check, validationResult } from 'express-validator';
import { Types } from 'mongoose';

import { User } from '../models/User';
import { Currency } from '../models/Currency';
import { IActive } from './../models/Active';
import { Active } from '../models/Active';
import { checkAuth } from '../middleware/auth.middleware';
import { return400 } from '../utils/return400';
import { returnValidationResult } from '../utils/returnValidationResult';

import { Error, Success, Val } from '../utils/getTexts';

const router = Router();

// /api/active/
router.post(
    '/',
    [check('id', Val.incorrectId).custom((id) => Types.ObjectId.isValid(id))],
    checkAuth,
    async (req: Request, res: Response) => {
        try {
            const userData = await User.findById(req.user.userId).populate({
                path: 'actives',
                populate: 'dividends',
            });
            if (!userData) {
                return return400(res, Error.userNotFound);
            }

            const active = userData.actives.filter(
                ({ _id }) =>
                    String(new Types.ObjectId(req.body.id)) ===
                    String(new Types.ObjectId(_id)),
            );

            if (active.length < 1) {
                return return400(res, Error.activeNotFound);
            }

            return res.json({
                message: Success.activeFound,
                active,
            });
        } catch (e) {
            res.status(500).json({ message: Error.somethingWrong });
        }
    },
);

// /api/active/all
router.post(
    '/all',
    [
        check('filters', Val.incorrectFilters)
            .optional()
            .isObject()
            .custom(
                (obj: Object) =>
                    obj.hasOwnProperty('currencyId') ||
                    obj.hasOwnProperty('status'),
            ),
    ],
    checkAuth,
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return returnValidationResult(res, errors);
            }

            const result = await User.findById(req.user.userId).populate([
                {
                    path: 'actives',
                    populate: { path: 'dividends', model: 'Dividend' },
                },
                { path: 'actives', populate: 'currency' },
            ]);

            if (!result) {
                return return400(res, Error.userNotFound);
            }
            const { filters } = req.body;
            let { actives } = result;

            if (filters) {
                if (filters.hasOwnProperty('currencyId')) {
                    const { currencyId } = filters;
                    if (!Types.ObjectId.isValid(currencyId)) {
                        return return400(res, Error.wrongCurrencyId);
                    } else {
                        actives = actives.filter(
                            ({ currency }) =>
                                String(new Types.ObjectId(currency._id)) ===
                                String(new Types.ObjectId(currencyId)),
                        );
                    }
                }

                if (filters.hasOwnProperty('status')) {
                    const { status: stat } = filters;
                    if (stat !== 'active' && stat !== 'inactive') {
                        return return400(res, Error.wrongStatus);
                    } else {
                        actives = actives.filter(
                            ({ status }) => stat === status,
                        );
                    }
                }
            }

            return res.json({
                message: Success.activesFound,
                actives,
            });
        } catch (e) {
            res.status(500).json({ message: Error.somethingWrong });
        }
    },
);

// /api/active/create
router.post(
    '/create',
    [
        check('title', Val.missingActiveTitle).isString(),
        check('currencyId', Val.incorrectCurrencyId).custom((id) =>
            Types.ObjectId.isValid(id),
        ),
        check('cash', Val.cashNotRecived).isFloat({ min: 0 }),
    ],
    checkAuth,
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return returnValidationResult(res, errors);
            }

            const { title, currencyId, cash } = req.body;

            const userData = await User.findById(req.user.userId);
            if (!userData) {
                return return400(res, Error.userNotFound);
            }

            const currentCurrency = await Currency.findById(currencyId);
            if (!currentCurrency) {
                return return400(res, Error.unexistedCurrency);
            }

            const activeData = {
                title,
                currency: currentCurrency,
                cash,
                status: 'active',
            };
            const active = new Active(activeData);
            active.save().then(async ({ _id }) => {
                await User.findByIdAndUpdate(req.user.userId, {
                    $push: {
                        actives: { _id, ...activeData },
                    },
                });

                return res.json({
                    message: Success.activeCreated,
                    active: { _id, ...activeData },
                });
            });
        } catch (e) {
            res.status(500).json({ message: Error.somethingWrong });
        }
    },
);

// /api/active/correct
router.post(
    '/correct',
    [
        check('id', Val.incorrectId).custom((id) => Types.ObjectId.isValid(id)),
        check('title', Val.missingActiveTitle).optional().isString(),
        check('currencyId', Val.incorrectCurrencyId)
            .optional()
            .custom((id) => Types.ObjectId.isValid(id)),
        check('cash', Val.cashNotRecived).optional().isFloat({ min: 0 }),
        check('status', Val.incorrectStatus)
            .optional()
            .custom((status) => status === 'active' || status === 'inactive'),
    ],
    checkAuth,
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return returnValidationResult(res, errors);
            }

            const { id, title, currencyId, cash, status = 'active' } = req.body;

            const userData = await User.findById(req.user.userId).populate(
                'actives',
            );
            if (!userData) {
                return return400(res, Error.userNotFound);
            }

            let currentActive: IActive = null;
            userData.actives.forEach((act) => {
                if (String(act._id) === String(new Types.ObjectId(id))) {
                    currentActive = act;
                }
            });
            if (!currentActive) {
                return return400(res, Error.activeNotFound);
            }

            const currentCurrency = await Currency.findById(
                currencyId ? currencyId : currentActive.currency._id,
            );
            if (!currentCurrency) {
                return return400(res, Error.unexistedCurrency);
            }

            const correctedData = {
                title: title ? title : currentActive.title,
                currency: currentCurrency,
                cash: cash ? cash : currentActive.cash,
                status,
            };

            await Active.findByIdAndUpdate(id, {
                ...correctedData,
            });

            return res.json({
                message: Success.activeCorrected,
            });
        } catch (e) {
            res.status(500).json({ message: Error.somethingWrong });
        }
    },
);

// /api/active/remove
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

            const userData = await User.findById(req.user.userId).populate(
                'actives',
            );
            if (!userData) {
                return return400(res, Error.userNotFound);
            }

            const { actives } = userData;
            let indexActive = -1;
            actives.forEach((act, index) => {
                if (
                    String(act._id) === String(new Types.ObjectId(req.body.id))
                ) {
                    indexActive = index;
                }
            });
            if (indexActive === -1) {
                return return400(res, Error.activeNotFound);
            }

            const newActiveList = [
                ...actives.slice(0, indexActive),
                ...actives.slice(indexActive + 1),
            ];

            await Active.findByIdAndRemove(req.body.id);
            await User.findByIdAndUpdate(req.user.userId, {
                actives: newActiveList,
            });

            return res.json({
                message: Success.activeRemoved,
            });
        } catch (e) {
            res.status(500).json({ message: Error.somethingWrong });
        }
    },
);

export = router;
