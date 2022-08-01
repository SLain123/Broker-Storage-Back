"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const express_1 = require("express");
const User_1 = require("../models/User");
const express_validator_1 = require("express-validator");
const auth_middleware_1 = require("../middleware/auth.middleware");
const return400_1 = require("../utils/return400");
const returnValidationResult_1 = require("../utils/returnValidationResult");
const router = express_1.Router();
// /api/broker
router.get('/', auth_middleware_1.checkAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield User_1.User.findById(req.user.userId).populate({
            path: 'brokerAccounts',
            populate: { path: 'currency' },
        });
        if (!result) {
            return return400_1.return400(res, 'User not found');
        }
        return res.json({
            message: 'A broker account(s) has been find',
            brokerAccounts: result.brokerAccounts,
        });
    }
    catch (e) {
        res.status(500).json({ message: 'Something was wrong...' });
    }
}));
// /api/broker/add
router.post('/add', [
    express_validator_1.check('title', 'Title of broker is missing').notEmpty(),
    express_validator_1.check('currency', 'Currency was not recived').notEmpty(),
], auth_middleware_1.checkAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = express_validator_1.validationResult(req);
        if (!errors.isEmpty()) {
            return returnValidationResult_1.returnValidationResult(res, errors);
        }
        const { title, currency, cash = 0 } = req.body;
        if (!currency._id || !currency.title || !currency.ticker) {
            return return400_1.return400(res, 'Currency have wrong format');
        }
        const result = yield User_1.User.findByIdAndUpdate(req.user.userId, {
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
        if (!result) {
            return return400_1.return400(res, 'User not found');
        }
        return res.json({ message: 'A broker account has been created' });
    }
    catch (e) {
        res.status(500).json({ message: 'Something was wrong...' });
    }
}));
// /api/broker/remove
router.post('/remove', [express_validator_1.check('_id', 'ID was not recived').notEmpty()], auth_middleware_1.checkAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = express_validator_1.validationResult(req);
        if (!errors.isEmpty()) {
            return returnValidationResult_1.returnValidationResult(res, errors);
        }
        // check on valid broker id and user;
        if (req.body._id.length !== 24 && req.body._id.length !== 12) {
            return return400_1.return400(res, 'Broker accound not found');
        }
        let isExistedBroker = false;
        const recivedId = new mongoose.mongo.ObjectId(req.body._id);
        const brokerList = yield User_1.User.findById(req.user.userId);
        if (!brokerList) {
            return return400_1.return400(res, 'User not found');
        }
        brokerList.brokerAccounts.forEach(({ _id }) => {
            if (String(_id) === String(recivedId)) {
                isExistedBroker = true;
            }
        });
        if (!isExistedBroker) {
            return return400_1.return400(res, 'Broker accound not found');
        }
        yield User_1.User.findByIdAndUpdate(req.user.userId, {
            $pull: {
                brokerAccounts: { _id: req.body._id },
            },
        });
        return res.json({ message: 'A broker account has been removed' });
    }
    catch (e) {
        res.status(500).json({ message: 'Something was wrong...' });
    }
}));
module.exports = router;
//# sourceMappingURL=broker.routes.js.map