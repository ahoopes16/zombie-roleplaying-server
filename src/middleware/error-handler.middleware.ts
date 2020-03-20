import { Context, Next, Middleware } from 'koa'

const errorHandler: Middleware = async (ctx: Context, next: Next) => {
    try {
        await next()
    } catch (error) {
        ctx.status = error.statusCode || error.status || 500
        ctx.body = { error: error.message }
    }
}

export default errorHandler
