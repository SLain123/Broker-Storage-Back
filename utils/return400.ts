export const return400 = (res, msg) =>
    res.status(400).json({
        errors: [
            {
                msg,
            },
        ],
    });
