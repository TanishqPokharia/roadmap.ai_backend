import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();
import { registerDependencies } from "./utils/register.dependencies";

// Importing necessary modules and registering dependencies
registerDependencies();

import express from "express";
import cors from "cors";
import v1Router from "./routes/v1/index";
import { httpLogger, logger } from "./utils/logger";
import errorHandler from "./middlewares/error.handler";
import cookieParser from "cookie-parser";
const app = express();

app.set("trust proxy", 1); // Trust first proxy

app.use(cors({
  origin: ["http://localhost:8080", process.env.ORIGIN],
  credentials: true,
  exposedHeaders: ['Set-Cookie']
}));


app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.urlencoded({ extended: true }));
app.use(httpLogger);


app.use("/api/v1", v1Router);

app.use(errorHandler);


// Connect to MongoDB
import "./mongodb";


app.listen(3000, () => {
  logger.info("Server is running on port 3000");
});

// Configure Cloudinary
import { v2 as cloudinary } from "cloudinary";
cloudinary.config({
  secure: true,
});

export default app;
