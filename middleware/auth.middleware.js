const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
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

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({
            message: 'Unauthorized! Token missing or uncorrect',
        });
    }
};
