"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const createRefreshToken = (userId) => {
    const secret = process.env.REFRESH_TOKEN_SECRET;
    const refreshToken = jsonwebtoken_1.default.sign({ userId }, secret, {
        expiresIn: "1 week",
        algorithm: "HS256",
    });
    return refreshToken;
};
exports.default = createRefreshToken;
