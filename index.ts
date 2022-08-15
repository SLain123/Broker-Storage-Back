import * as express from 'express';
import * as mongoose from 'mongoose';
import * as formData from 'express-form-data';
import * as dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';

import * as authRoutes from './routes/auth.routes';
import * as profileRoutes from './routes/profile.routes';
import * as currencyRoutes from './routes/currency.routes';
import * as brokerRoutes from './routes/broker.routes';
import * as stockRoutes from './routes/stock.routes';
import * as dividendRoutes from './routes/dividend.routes';
import * as activeRoutes from './routes/active.routes';
import * as activePaymentRoutes from './routes/activePayment.routes';
import * as statRoutes from './routes/stat.routes';

const app = express();
dotenv.config();
const PORT = process.env.PORT || 5000;
const MONGOURI =
    process.env.MONGO_URI ||
    'mongodb+srv://Admin:111111sl@cluster0.flch8ls.mongodb.net/broker?retryWrites=true&w=majority';

declare global {
    namespace Express {
        interface Request {
            user: { userId: string };
        }
    }
}

app.use((req: Request, res: Response, next: NextFunction) => {
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

app.use(express.json({ limit: '200kb' }));
app.use(
    express.urlencoded({
        extended: true,
        limit: '200kb',
    }),
);
app.use(formData.parse());

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/currency', currencyRoutes);
app.use('/api/broker', brokerRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/dividend', dividendRoutes);
app.use('/api/active', activeRoutes);
app.use('/api/active/pay', activePaymentRoutes);
app.use('/api/stat', statRoutes);

async function start() {
    try {
        await mongoose.connect(MONGOURI, {
            // @ts-ignore
            useUnifiedTopology: true,
        });
        app.listen(PORT, () => console.log(`Node works on port: ${PORT}`));
    } catch (e) {
        console.log(`Error: ${e.message}`);
        process.exit(1);
    }
}

start();
