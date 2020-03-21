import * as Koa from 'koa'
import { Model } from 'mongoose'
import encounterModel, { Encounter } from '../models/encounter.model'

export default class EncounterController {
    private model: Model<Encounter>
    constructor(model = encounterModel()) {
        this.model = model
    }

    public getEncounters: Koa.Middleware = async ctx => {
        ctx.body = { result: await this.model.find().exec() }
    }

    public createEncounter: Koa.Middleware = async ctx => {
        const { body } = ctx.request

        ctx.assert(body.title && typeof body.title === 'string', 400, `An encounter requires a title of type string`)
        ctx.assert(
            body.description && typeof body.description === 'string',
            400,
            `An encounter requires a description of type string`,
        )

        const encounter = await this.model.create(ctx.request.body)
        ctx.body = { result: encounter }
    }
}
