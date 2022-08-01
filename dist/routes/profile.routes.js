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
const express_1 = require("express");
const User_1 = require("../models/User");
const express_validator_1 = require("express-validator");
const auth_middleware_1 = require("../middleware/auth.middleware");
const return400_1 = require("../utils/return400");
const returnValidationResult_1 = require("../utils/returnValidationResult");
const router = express_1.Router();
// /api/profile
router.get('/', auth_middleware_1.checkAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield User_1.User.findById(req.user.userId)
            .populate('defaultCurrency')
            .populate({
            path: 'brokerAccounts',
            populate: { path: 'currency' },
        });
        if (!result) {
            return return400_1.return400(res, 'User not found');
        }
        const { nickName, avatar, defaultCurrency, brokerAccounts } = result;
        return res.json({
            message: 'User found',
            nickName,
            avatar,
            defaultCurrency,
            brokerAccounts,
        });
    }
    catch (e) {
        res.status(500).json({ message: 'Something was wrong...' });
    }
}));
// /api/profile
router.post('/', [express_validator_1.check('nickName', 'User nick name is missing').notEmpty()], auth_middleware_1.checkAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = express_validator_1.validationResult(req);
        if (!errors.isEmpty()) {
            return returnValidationResult_1.returnValidationResult(res, errors);
        }
        const { nickName } = req.body;
        const result = yield User_1.User.findByIdAndUpdate(req.user.userId, {
            nickName,
        });
        if (!result) {
            return return400_1.return400(res, 'User not found');
        }
        return res.json({ message: 'User data has been changed' });
    }
    catch (e) {
        res.status(500).json({ message: 'Something was wrong...' });
    }
}));
// /api/profile/avatar
router.post('/avatar', [express_validator_1.check('avatar', 'Avatar must be base64 format').notEmpty()], auth_middleware_1.checkAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = express_validator_1.validationResult(req);
        if (!errors.isEmpty()) {
            return returnValidationResult_1.returnValidationResult(res, errors);
        }
        const { avatar } = req.body;
        const result = yield User_1.User.findByIdAndUpdate(req.user.userId, {
            avatar,
        });
        if (!result) {
            return return400_1.return400(res, 'User not found');
        }
        return res.json({ message: 'User data has been changed' });
    }
    catch (e) {
        res.status(500).json({ message: 'Something was wrong...' });
    }
}));
module.exports = router;
//# sourceMappingURL=profile.routes.js.map