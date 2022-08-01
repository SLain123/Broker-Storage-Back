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
const express = require("express");
const mongoose = require("mongoose");
const formData = require("express-form-data");
const dotenv = require("dotenv");
const app = express();
dotenv.config();
const PORT = process.env.PORT || 5000;
const MONGOURI = process.env.MONGO_URI;
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method == 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});
// @ts-ignore
app.use(express.json({ limit: '1mb', extended: true }));
app.use(express.urlencoded({
    extended: true,
    limit: '1mb',
    parameterLimit: 1000,
}));
app.use(formData.parse());
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/profile', require('./routes/profile.routes'));
app.use('/api/currency', require('./routes/currency.routes'));
app.use('/api/broker', require('./routes/broker.routes'));
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield mongoose.connect(MONGOURI, {
                // @ts-ignore
                useUnifiedTopology: true,
            });
            app.listen(PORT, () => console.log(`Node works on port: ${PORT}`));
        }
        catch (e) {
            console.log(`Error: ${e.message}`);
            process.exit(1);
        }
    });
}
start();
//# sourceMappingURL=index.js.map