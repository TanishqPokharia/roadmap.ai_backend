"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
const errorHandler = (error, req, res, next) => {
    // Log all errors for debugging
    logger_1.logger.error(error, "Error caught by error handler:");
    if (error instanceof errors_1.NotFoundError) {
        res.status(404).json({ error: error.message });
        return;
    }
    if (error instanceof errors_1.AccessDeniedError) {
        res.status(403).json({ error: error.message });
        return;
    }
    if (error instanceof errors_1.ValidationError) {
        res.status(400).json({ error: error.message });
        return;
    }
    // Log unexpected errors with full details
    logger_1.logger.error(error, "Unexpected error - sending 500 response");
    res.status(500).json({ error: `${error.message}` });
};
exports.default = errorHandler;
