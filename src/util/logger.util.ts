import { createLogger, format, transports } from 'winston'

const logger = createLogger({
    // TODO Make the log level configurable via the environment
    level: 'info',
    format: format.combine(format.json(), format.colorize()),
    transports: [
        new transports.File({ filename: 'error.log', level: 'error' }),
        new transports.File({ filename: 'combined.log' }),
    ],
})

if (process.env.NODE_ENV !== 'production') {
    logger.add(
        new transports.Console({
            format: format.simple(),
        }),
    )
}

export default logger
