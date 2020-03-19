import * as Koa from 'koa'
import * as Router from 'koa-router'
import * as bodyParser from 'koa-body'

const app = new Koa()
const router = new Router()
const port = 8000

// Keep this as early as possible, takes care of parsing JSON
app.use(bodyParser())

router.get('/*', async ctx => {
   ctx.body = 'This will be the zombie roleplaying game API!'
})

app.use(router.routes())
app.use(router.allowedMethods())

app.listen(port, () => console.log(`Zombie Roleplaying Server listening on port ${port}!`))
