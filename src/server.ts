import * as Koa from 'koa'
import * as bodyParser from 'koa-body'
import * as cors from 'koa2-cors'
import * as Router from 'koa-router'
import errorHandler from './middleware/error-handler.middleware'
import * as KoaLogger from 'koa-logger-winston'
import logger from './util/logger.util'
import DBConnector from './database'
import env from './environment'
import { RegisterRoutes } from './routes'

async function runServer(): Promise<void> {
    await new DBConnector().connect()

    const app = new Koa()
    const port = env.port || 8000

    // Keep these as early as possible, takes care of parsing JSON, logging, and error handling
    app.use(cors())
    app.use(bodyParser())
    app.use(KoaLogger(logger))
    app.use(errorHandler)

    // Apply routes
    const tsoaRouter = new Router({})
    RegisterRoutes(tsoaRouter)
    app.use(tsoaRouter.routes())
    app.use(tsoaRouter.allowedMethods())

    // Start listening
    app.listen(port, () => logger.info(`Zombie Roleplaying Server listening on port ${port}!`))
}

runServer()
