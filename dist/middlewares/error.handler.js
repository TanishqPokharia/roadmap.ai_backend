import { AccessDeniedError, NotFoundError, ValidationError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";
const errorHandler = (error, req, res, next) => {
    // Log all errors for debugging
    logger.error(error, "Error caught by error handler:");
    if (error instanceof NotFoundError) {
        res.status(404).json({ error: error.message });
        return;
    }
    if (error instanceof AccessDeniedError) {
        res.status(403).json({ error: error.message });
        return;
    }
    if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
        return;
    }
    // Log unexpected errors with full details
    logger.error(error, "Unexpected error - sending 500 response");
    res.status(500).json({ error: `${error.message}` });
};
export default errorHandler;
