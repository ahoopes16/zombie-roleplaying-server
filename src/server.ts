import * as Koa from 'koa'
import * as bodyParser from 'koa-body'
import errorHandler from './middleware/error-handler.middleware'
import * as KoaLogger from 'koa-logger-winston'
import router from './routes'
import logger from './util/logger.util'
import DBConnector from './database'
import env from './environment'

async function runServer(): Promise<void> {
    await new DBConnector().connect()

    const app = new Koa()
    const port = env.port || 8000

    // Keep these as early as possible, takes care of parsing JSON, logging, and error handling
    app.use(bodyParser())
    app.use(KoaLogger(logger))
    app.use(errorHandler)

    // Apply routes
    app.use(router())

    // Start listening
    app.listen(port, () => logger.info(`Zombie Roleplaying Server listening on port ${port}!`))
}

runServer()
