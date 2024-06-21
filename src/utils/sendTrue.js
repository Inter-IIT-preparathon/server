const sendTrue = (res, statusCode, message) => {
    res.status(statusCode).json({
        success: true,
        message: message
    });
}

module.exports = sendTrue;