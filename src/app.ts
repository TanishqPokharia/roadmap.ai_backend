import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();
import { registerDependencies } from "./utils/register.dependencies";

// Importing necessary modules and registering dependencies
registerDependencies();

import express from "express";
import v1Router from "./routes/v1/index";
import mongoose from "mongoose";
import { httpLogger, logger } from "./utils/logger";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(httpLogger);

app.use("/api/v1", v1Router);

// Connect to MongoDB
mongoose
  .connect(`${process.env.DB_URL}`)
  .then((result) => {
    logger.info("Connected to MongoDB successfully");
  })
  .catch((error) => {
    const message = (error as Error).message;
    logger.fatal("Failed to connect to MongoDB:", message);
  });

app.listen(3000, () => {
  logger.info("Server is running on port 3000");
});

// Configure Cloudinary
import { v2 as cloudinary } from "cloudinary";
cloudinary.config({
  secure: true,
});
