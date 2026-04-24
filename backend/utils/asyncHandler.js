export const asyncHandler = (handler) => async (req, res, next) => {
    // Forward async route errors to Express error middleware instead of crashing.
    try {
        await handler(req, res, next);
    } catch (error) {
        next(error);
    }
};
