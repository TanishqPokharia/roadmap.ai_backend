
import { attachDatabasePool } from "@vercel/functions";
import mongoose, { ConnectOptions } from "mongoose";
import { logger } from "./utils/logger";

const options: ConnectOptions = {
  appName: "devrel.vercel.integration",
  maxIdleTimeMS: 5000,
  maxPoolSize: 10,
};


const connection = mongoose.connect(process.env.DB_URL, options).then((client) => {
  attachDatabasePool(client.connection.getClient());
  logger.info("Connected to db");
  return client;
}).catch((error) => {
  console.error("Error connecting to mongodb");
  console.error(error);
});


export default connection;