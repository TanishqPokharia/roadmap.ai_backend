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
import useragent from "express-useragent";
import cookieParser from "cookie-parser";
const app = express();

app.set("trust proxy", 1); // Trust first proxy

// Enable CORS for all origins with credentials
app.use(cors({
  origin: [process.env.ORIGIN, "https://main.d20iqmdu4e490z.amplifyapp.com"], // Allow all origins
  credentials: true, // Allow cookies to be sent
  exposedHeaders: ['Set-Cookie'] // Expose Set-Cookie header to the client,
}));

app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.urlencoded({ extended: true }));
app.use(httpLogger);
app.use(useragent.express());


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
