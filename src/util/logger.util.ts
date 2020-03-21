import { createLogger, format, transports } from 'winston'
import env from '../environment'

const logger = createLogger({
    level: env.logLevel,
    format: format.combine(format.json(), format.colorize()),
    transports: [
        new transports.File({ filename: 'error.log', level: 'error' }),
        new transports.File({ filename: 'combined.log' }),
    ],
})

if (env.nodeEnv !== 'production') {
    logger.add(
        new transports.Console({
            format: format.simple(),
        }),
    )
}

export default logger
