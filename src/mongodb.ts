import { attachDatabasePool } from "@vercel/functions";
import mongoose, { ConnectOptions } from "mongoose";
import { logger } from "./utils/logger";

const options: ConnectOptions = {
  appName: "roadmap.ai",
  timeoutMS: 30000,
  connectTimeoutMS: 30000,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 30000,
  minPoolSize: 2,
  maxIdleTimeMS: 45000,
  maxPoolSize: 10,
  retryReads: true,
};


mongoose.connect(process.env.MONGODB_URI, options).then((client) => {
  attachDatabasePool(client.connection.getClient());
  logger.info("Connected to db");
  return client;
}).catch((error) => {
  console.error("Error connecting to mongodb");
  console.error(error);
});
