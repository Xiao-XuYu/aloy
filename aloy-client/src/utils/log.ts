import path from "node:path";
import { Mode } from "./mode";

import winston from "winston"

const log = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
        //
        // - Write all logs with importance level of `error` or higher to `error.log`
        //   (i.e., error, fatal, but not other levels)
        //
        new winston.transports.File({ filename: path.resolve(__dirname, "../../logs", 'error.log') , level: 'error' }),
        //
        // - Write all logs with importance level of `info` or higher to `combined.log`
        //   (i.e., fatal, error, warn, and info, but not trace)
        //
        new winston.transports.File({ filename: path.resolve(__dirname, "../../logs", 'combined.log') }),
    ],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (!Mode.isProd) {
    log.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}

export default log