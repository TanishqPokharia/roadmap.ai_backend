import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();
import { registerDependencies } from "./utils/register.dependencies";

// Importing necessary modules and registering dependencies
registerDependencies();

import express from "express";
import morgan from "morgan";
import pino from "pino-http";
import logger from "./utils/logger";
import v1Router from "./routes/v1/index";
const app = express();
app.use(morgan("dev"));
app.use(pino());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", v1Router);

app.listen(3000, () => {
  logger.info("Server is running on port 3000");
});
