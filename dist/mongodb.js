"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = require("@vercel/functions");
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = require("./utils/logger");
const options = {
    appName: "devrel.vercel.integration",
    maxIdleTimeMS: 5000,
    maxPoolSize: 10,
};
const connection = mongoose_1.default.connect(process.env.MONGODB_URI, options).then((client) => {
    (0, functions_1.attachDatabasePool)(client.connection.getClient());
    logger_1.logger.info("Connected to db");
    return client;
}).catch((error) => {
    console.error("Error connecting to mongodb");
    console.error(error);
});
exports.default = connection;
