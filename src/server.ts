import * as Koa from 'koa'
import * as Router from 'koa-router'
import * as bodyParser from 'koa-body'
import * as KoaLogger from 'koa-logger-winston'
import logger from './util/logger.util'

const app = new Koa()
const router = new Router()
const port = 8000

// Keep this as early as possible, takes care of parsing JSON
app.use(bodyParser())
app.use(KoaLogger(logger))

router.get('/*', async ctx => {
    logger.info(`A route was called! It looked like ${ctx.path}!`)
    ctx.body = 'This will be the zombie roleplaying game API!'
})

app.use(router.routes())
app.use(router.allowedMethods())

app.listen(port, () => console.log(`Zombie Roleplaying Server listening on port ${port}!`))
