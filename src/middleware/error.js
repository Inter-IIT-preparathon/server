class ErrorHandler extends Error {
    constructor(message, statusCode = 500) {
        //* constructor of Error(parent class)
        super(message);
        this.statusCode = statusCode
    }
}

const errorMiddleware = (err, req, res, next) => {
    err.message = err.message || "Internal server error";
    err.statusCode = err.statusCode || 500;
    res.status(err.statusCode).json({
        success: false,
        error: err.message
    });
}

module.exports = { ErrorHandler, errorMiddleware };
