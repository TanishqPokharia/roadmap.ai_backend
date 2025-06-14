import pino from "pino";
import pinoHttp from "pino-http";
const logger = pino({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      messageFormat: "{req.method} {req.url} - {res.statusCode} - {msg}",
    },
  },
});

const httpLogger = pinoHttp({
  logger,
});

export { logger, httpLogger };
