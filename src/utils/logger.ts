import pino from "pino";
import pinoHttp from "pino-http";

// Configure logger based on environment
const logger = pino(
  process.env.NODE_ENV === "prod" || process.env.VERCEL
    ? {
      // Production configuration - simple JSON output
      level: "info",
    }
    : {
      // Development configuration - pretty output
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          messageFormat: "{req.method} {req.url} - {res.statusCode} - {msg}",
          ignore: "req.remoteAddress,req.remotePort,req.id,req.query,req.params",
        },
        level: "debug",
      },
    }
);

const httpLogger = pinoHttp({
  logger,
});

export { logger, httpLogger };
