const express = require('express');
const mongoose = require('mongoose');
const formData = require('express-form-data');
const dotenv = require('dotenv');

const app = express();
dotenv.config();
const PORT = process.env.PORT || 5000;
const MONGOURI = process.env.MONGO_URI;

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    );
    if (req.method == 'OPTIONS') {
        res.header(
            'Access-Control-Allow-Methods',
            'PUT, POST, PATCH, DELETE, GET',
        );
        return res.status(200).json({});
    }

    next();
});
app.use(express.json({ limit: '1mb', extended: true }));
app.use(
    express.urlencoded({
        extended: true,
        limit: '1mb',
        parameterLimit: 1000,
    }),
);
app.use(formData.parse());
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/profile', require('./routes/profile.routes'));
app.use('/api/tools', require('./routes/currency.routes'));

async function start() {
    try {
        await mongoose.connect(MONGOURI, {
            useUnifiedTopology: true,
        });
        app.listen(PORT, () => console.log(`Node works on port: ${PORT}`));
    } catch (e) {
        console.log(`Error: ${e.message}`);
        process.exit(1);
    }
}

start();
