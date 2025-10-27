"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = require("../utils/logger");
const checkToken = async (req, res, next) => {
    if (req.useragent?.isAndroid || req.useragent?.isiPhone || req.useragent?.isiPad || req.useragent?.isMobile) {
        mobileHandler(req, res, next);
        return;
    }
    webHandler(req, res, next);
};
const webHandler = (req, res, next) => {
    try {
        // check cookies for token
        const tokens = req.signedCookies.tokens;
        if (!tokens) {
            logger_1.logger.warn("No tokens found in signed cookies");
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const accessToken = req.signedCookies.tokens.accessToken;
        if (!accessToken) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const token = jsonwebtoken_1.default.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        if (typeof token === "string") {
            res.status(401).json({ error: "Unauthorized: Invalid token format" });
            return;
        }
        // pino provides a token property in the request object
        req.token = token.id;
        next();
    }
    catch (error) {
        logger_1.logger.error(error, "Error verifying token:");
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(401).json({ error: "Unauthorized: Invalid token" });
            return;
        }
    }
};
const mobileHandler = (req, res, next) => {
    try {
        const auth = req.headers.authorization?.split(" ");
        if (!auth || auth.at(0) !== "Bearer" || !auth.at(1)) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const tokenString = auth[1];
        const token = jsonwebtoken_1.default.verify(tokenString, process.env.ACCESS_TOKEN_SECRET, { algorithms: ["HS256"] });
        if (typeof token === "string") {
            res.status(401).json({ error: "Unauthorized: Invalid token format" });
            return;
        }
        // pino provides a token property in the request object
        req.token = token.id;
        next();
    }
    catch (error) {
        logger_1.logger.error(error, "Error verifying token:");
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(401).json({ error: "Unauthorized: Invalid token" });
            return;
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({ error: "Unauthorized: Token expired" });
            return;
        }
        res.status(500).json({ error: "Internal Server Error" });
        return;
    }
};
exports.default = checkToken;
