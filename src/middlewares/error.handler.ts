import { NextFunction, Request, Response } from "express";

const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
    if (error instanceof NotFoundError) res.status(404).json({ error: error.message });
    if (error instanceof AccessDeniedError) res.status(401).json({ error: error.message });
    res.status(500).json({ error: "Internal Server Error" });
}

export default errorHandler;