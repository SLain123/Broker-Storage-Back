"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.returnValidationResult = void 0;
exports.returnValidationResult = (res, err) => res.status(400).json({
    errors: err.array(),
    message: 'Data uncorrect!',
});
//# sourceMappingURL=returnValidationResult.js.map