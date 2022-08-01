export const returnValidationResult = (res, err) =>
    res.status(400).json({
        errors: err.array(),
        message: 'Data uncorrect!',
    });
