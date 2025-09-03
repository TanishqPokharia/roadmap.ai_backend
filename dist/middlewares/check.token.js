"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = require("../utils/logger");
const checkToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    if (((_a = req.useragent) === null || _a === void 0 ? void 0 : _a.isAndroid) || ((_b = req.useragent) === null || _b === void 0 ? void 0 : _b.isiPhone) || ((_c = req.useragent) === null || _c === void 0 ? void 0 : _c.isiPad) || ((_d = req.useragent) === null || _d === void 0 ? void 0 : _d.isMobile)) {
        mobileHandler(req, res, next);
        return;
    }
    webHandler(req, res, next);
});
const webHandler = (req, res, next) => {
    try {
        // check cookies for token
        const tokenString = req.signedCookies.tokens.accessToken;
        if (!tokenString) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const token = jsonwebtoken_1.default.verify(tokenString, process.env.ACCESS_TOKEN_SECRET);
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
    var _a;
    try {
        const auth = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ");
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
