"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAuth = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
exports.checkAuth = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next();
    }
    try {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).json({
                message: 'Unauthorized! Token missing in the request',
            });
        }
        const decoded = jsonwebtoken_1.jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (err) {
        res.status(401).json({
            message: 'Unauthorized! Token missing or uncorrect',
        });
    }
};
//# sourceMappingURL=auth.middleware.js.map