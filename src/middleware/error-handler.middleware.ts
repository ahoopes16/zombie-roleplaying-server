import { Context, Next, Middleware } from 'koa'
import { ValidateError } from 'tsoa'
import logger from '../util/logger.util'

export interface ValidateErrorJSON {
    error: 'Validation Failed'
    details: { [name: string]: unknown }
}

const errorHandler: Middleware = async (ctx: Context, next: Next) => {
    try {
        await next()
    } catch (error) {
        if (error instanceof ValidateError) {
            logger.error(`Caught validation error for ${ctx.request.path}:`, error.fields)
            ctx.status = 400
            const body: ValidateErrorJSON = {
                error: 'Validation Failed',
                details: error?.fields,
            }
            ctx.body = body

            return
        } else {
            ctx.status = error.statusCode || error.status || 500
            ctx.body = { error: error.message }
        }
    }
}

export default errorHandler
