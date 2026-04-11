import { attachDatabasePool } from "@vercel/functions";
import mongoose, { ConnectOptions } from "mongoose";
import { logger } from "./utils/logger.js";

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


const connectToMongoDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI ?? "", options).then((client: any) => {
    attachDatabasePool(client.connection.getClient());
    logger.info("Connected to db");
    return client;
  }).catch((error: any) => {
    console.error("Error connecting to mongodb");
    console.error(error);
  });
}

export default connectToMongoDB;