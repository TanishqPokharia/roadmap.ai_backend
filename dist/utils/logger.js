"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpLogger = exports.logger = void 0;
const pino_1 = __importDefault(require("pino"));
const pino_http_1 = __importDefault(require("pino-http"));
// Configure logger based on environment
const logger = (0, pino_1.default)(process.env.NODE_ENV === "prod" || process.env.VERCEL
    ? {
        // Production configuration - simple JSON output
        level: "info",
    }
    : {
        // Development configuration - pretty output
        transport: {
            target: "pino-pretty",
            options: {
                colorize: true,
                messageFormat: "{req.method} {req.url} - {res.statusCode} - {msg}",
                ignore: "req.remoteAddress,req.remotePort,req.id,req.query,req.params",
            },
            level: "debug",
        },
    });
exports.logger = logger;
const httpLogger = (0, pino_http_1.default)({
    logger,
});
exports.httpLogger = httpLogger;
