import { Context, Next, Middleware } from 'koa'
import { isBoom } from '@hapi/boom'
import { ErrorResponseJSON } from '../types/Response.type'

const errorHandler: Middleware = async (ctx: Context, next: Next) => {
    try {
        await next()
    } catch (error) {
        ctx.status = isBoom(error) ? error.output.statusCode : error.statusCode || error.status || 500
        const body: ErrorResponseJSON = { error: error.message }
        ctx.body = body
    }
}

export default errorHandler
