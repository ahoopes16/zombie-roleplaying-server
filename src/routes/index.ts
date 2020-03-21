import * as combineRouters from 'koa-combine-routers'
import encounterRouter from './encounter.route'

const router = combineRouters(encounterRouter)

export default router
