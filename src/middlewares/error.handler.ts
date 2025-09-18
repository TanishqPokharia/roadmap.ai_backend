import { NextFunction, Request, Response } from "express";
import { AccessDeniedError, NotFoundError, ValidationError } from "../utils/errors";
import { logger } from "../utils/logger";

const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
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
}

export default errorHandler;