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
const bcrypt_1 = require("bcrypt");
const express_validator_1 = require("express-validator");
const jsonwebtoken_1 = require("jsonwebtoken");
const auth_middleware_1 = require("../middleware/auth.middleware");
const return400_1 = require("../utils/return400");
const returnValidationResult_1 = require("../utils/returnValidationResult");
const router = express_1.Router();
// /api/auth/register
router.post('/register', [
    express_validator_1.check('email', 'Wrong email format').isEmail(),
    express_validator_1.check('password', 'Uncorrect password, minimum 6 symbols').isLength({
        min: 6,
    }),
    express_validator_1.check('nickName', 'User nick name is missing').notEmpty(),
    express_validator_1.check('defaultCurrency', 'Default currency was not recived').notEmpty(),
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = express_validator_1.validationResult(req);
        if (!errors.isEmpty()) {
            return returnValidationResult_1.returnValidationResult(res, errors);
        }
        const { email, password, nickName, defaultCurrency } = req.body;
        const candidateByMail = yield User_1.User.findOne({ email });
        if (candidateByMail) {
            return return400_1.return400(res, 'User email already exists!');
        }
        if (!defaultCurrency._id ||
            !defaultCurrency.title ||
            !defaultCurrency.ticker) {
            return return400_1.return400(res, 'Currency have wrong format');
        }
        const hashedPassword = yield bcrypt_1.bcrypt.hash(password, 11);
        const user = new User_1.User({
            email,
            password: hashedPassword,
            nickName,
            avatar: null,
            role: 'user',
            defaultCurrency,
            brokerAccounts: [],
            stoсks: [],
            relatedPayments: [],
        });
        yield user.save();
        res.status(201).json({ message: 'User was create!' });
    }
    catch (e) {
        res.status(500).json({ message: 'Something was wrong...' });
    }
}));
// /api/auth/login
router.post('/login', [
    express_validator_1.check('email', 'Type correct email').isEmail(),
    express_validator_1.check('password', 'Type password').exists(),
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = express_validator_1.validationResult(req);
        if (!errors.isEmpty()) {
            return returnValidationResult_1.returnValidationResult(res, errors);
        }
        console.log('test');
        const { email, password } = req.body;
        const user = yield User_1.User.findOne({ email });
        if (!user) {
            return return400_1.return400(res, "User doesn't exist!");
        }
        const isMatch = yield bcrypt_1.bcrypt.compare(password, user === null || user === void 0 ? void 0 : user.password);
        if (!isMatch) {
            return return400_1.return400(res, 'Password incorrect!');
        }
        const token = jsonwebtoken_1.jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
            expiresIn: '10d',
        });
        res.json({
            token,
            userId: user.id,
            message: 'Success!',
        });
    }
    catch (e) {
        res.status(500).json({ message: 'Something was wrong...' });
    }
}));
// /api/auth/check
router.get('/check', auth_middleware_1.checkAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.user.userId) {
            return res.json({ message: 'Token correct', validate: true });
        }
        else {
            return res.json({ message: 'Token uncorrect', validate: false });
        }
    }
    catch (e) {
        res.status(500).json({ message: 'Something was wrong...' });
    }
}));
module.exports = router;
//# sourceMappingURL=auth.routes.js.map