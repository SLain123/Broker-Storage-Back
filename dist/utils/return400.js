"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.return400 = void 0;
exports.return400 = (res, msg) => res.status(400).json({
    errors: [
        {
            msg,
        },
    ],
});
//# sourceMappingURL=return400.js.map