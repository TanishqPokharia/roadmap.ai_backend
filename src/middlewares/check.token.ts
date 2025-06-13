import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import logger from "../utils/logger";
const checkToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = req.headers.authorization?.split(" ");
    if (!auth || auth.at(0) !== "Bearer" || !auth.at(1)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const tokenString = auth[1];
    const token = jwt.verify(
      tokenString,
      process.env.ACCESS_TOKEN_SECRET as string,
      { algorithms: ["HS256"] }
    );
    if (typeof token === "string") {
      return res
        .status(401)
        .json({ error: "Unauthorized: Invalid token format" });
    }

    req.token = token.id;

    next();
  } catch (error) {
    logger.error(error, "Error verifying token:");
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: "Unauthorized: Token expired" });
    }

    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export default checkToken;
