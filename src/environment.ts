import * as dotenv from 'dotenv'
dotenv.config()

export default {
    nodeEnv: process.env.NODE_ENV,
    port: parseInt(process.env.PORT, 10),
    mongo: {
        host: process.env.MONGO_HOST,
        port: parseInt(process.env.MONGO_PORT, 10),
        db: process.env.MONGO_DB,
    },
    logLevel: process.env.LOG_LEVEL,
}
