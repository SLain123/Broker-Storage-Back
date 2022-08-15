import { verify } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { Error } from '../utils/getTexts';

export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'OPTIONS') {
        return next();
    }

    try {
        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({
                message: Error.missingToker,
            });
        }

        const decoded = verify(
            token.replace('Bearer ', ''),
            process.env.JWT_SECRET || 'superSecret',
        );
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({
            message: Error.missingToker,
        });
    }
};
