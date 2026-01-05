"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const register_dependencies_1 = require("./utils/register.dependencies");
// Importing necessary modules and registering dependencies
(0, register_dependencies_1.registerDependencies)();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const index_1 = __importDefault(require("./routes/v1/index"));
const logger_1 = require("./utils/logger");
const error_handler_1 = __importDefault(require("./middlewares/error.handler"));
const express_useragent_1 = __importDefault(require("express-useragent"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app = (0, express_1.default)();
app.set("trust proxy", 1); // Trust first proxy
app.use((0, cors_1.default)({
    origin: ["http://localhost:8080", process.env.ORIGIN],
    credentials: true,
    exposedHeaders: ['Set-Cookie']
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)(process.env.COOKIE_SECRET));
app.use(express_1.default.urlencoded({ extended: true }));
app.use(logger_1.httpLogger);
app.use(express_useragent_1.default.express());
app.use("/api/v1", index_1.default);
app.use(error_handler_1.default);
// Connect to MongoDB
require("./mongodb");
app.listen(3000, () => {
    logger_1.logger.info("Server is running on port 3000");
});
// Configure Cloudinary
const cloudinary_1 = require("cloudinary");
cloudinary_1.v2.config({
    secure: true,
});
exports.default = app;
