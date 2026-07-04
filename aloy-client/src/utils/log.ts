import path from "node:path";
import { Mode } from "./mode";

import { default as winston, createLogger, format, transports } from 'winston';
const { combine, timestamp, printf, colorize, json } = format;



const logger: any = createLogger({
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    // json(),
     format.printf(({ timestamp, level, message, ...other }) => {
      // console.log("other", other)
      return `[${timestamp}][${level.toUpperCase()}]${message}${((other.args as any[])||[]).map(v => {
        return typeof v === "object" ? JSON.stringify(v) : v;
      }).join(" ")}`;
    }),
    // colorize(),
  ),
  transports: [
    new transports.Console(),
    //
    // - Write all logs with importance level of `error` or higher to `error.log`
    //   (i.e., error, fatal, but not other levels)
    //
    new winston.transports.File({ filename: path.resolve(__dirname, "../../logs", 'error.log'), level: 'error' }),
    //
    // - Write all logs with importance level of `info` or higher to `combined.log`
    //   (i.e., fatal, error, warn, and info, but not trace)
    //
    new winston.transports.File({ filename: path.resolve(__dirname, "../../logs", 'combined.log') }),
  ],
});

// 输出：2025-08-20 15:22:30 [info] 测试日志，带时间


//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
// if (!Mode.isProd) {
//     log.add(new winston.transports.Console({
//         format: winston.format.simple(),
//     }));
// }

const log = {
  info: (...args) => logger.info('', {args}),
  warn: (...args) => logger.warn('', { args }),
  error: (...args) => logger.error('', { args }),
  debug: (...args) => logger.debug('', { args }),
};

export default log