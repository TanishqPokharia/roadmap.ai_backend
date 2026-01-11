import { attachDatabasePool } from "@vercel/functions";
import mongoose, { ConnectOptions } from "mongoose";
import { logger } from "./utils/logger";

const options: ConnectOptions = {
  appName: "devrel.vercel.integration",
  timeoutMS: 10000,
  connectTimeoutMS: 10000,
  minPoolSize: 10,
  maxIdleTimeMS: 5000,
  maxPoolSize: 20,
};


mongoose.connect(process.env.MONGODB_URI, options).then((client) => {
  attachDatabasePool(client.connection.getClient());
  logger.info("Connected to db");
  return client;
}).catch((error) => {
  console.error("Error connecting to mongodb");
  console.error(error);
});
