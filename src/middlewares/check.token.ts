import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { logger } from "../utils/logger";
const checkToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const auth = req.headers.authorization?.split(" ");
    if (!auth || auth.at(0) !== "Bearer" || !auth.at(1)) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const tokenString = auth[1];
    const token = jwt.verify(
      tokenString,
      process.env.ACCESS_TOKEN_SECRET as string,
      { algorithms: ["HS256"] }
    );
    if (typeof token === "string") {
      res.status(401).json({ error: "Unauthorized: Invalid token format" });
      return;
    }

    // pino provides a token property in the request object
    req.token = token.id;

    next();
  } catch (error) {
    logger.error(error, "Error verifying token:");
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: "Unauthorized: Invalid token" });
      return;
    }
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: "Unauthorized: Token expired" });
      return;
    }

    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
};

export default checkToken;
