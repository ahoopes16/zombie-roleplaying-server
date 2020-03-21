import * as Koa from 'koa'
import { Model } from 'mongoose'
import EncounterModel, { Encounter } from '../models/encounter.model'

export class EncounterController {
    private model: Model<Encounter>
    constructor(model = EncounterModel()) {
        this.model = model
    }

    public getEncounters: Koa.Middleware = async ctx => {
        ctx.body = { result: await this.model.find().exec() }
    }

    public createEncounter: Koa.Middleware = async ctx => {
        const encounter = ctx.request.body

        const hasProperTitle = !!(encounter.title && typeof encounter.title === 'string')
        ctx.assert(hasProperTitle, 400, 'An encounter requires a title property of type string.')

        const hasProperDescription = !!(encounter.description && typeof encounter.description === 'string')
        ctx.assert(hasProperDescription, 400, 'An encounter requires a description property of type string.')

        const encounterWithSameTitle = !!(await this.model.findOne({ title: encounter.title }).exec())
        ctx.assert(!encounterWithSameTitle, 400, `An encounter with the title ${encounter.title} already exists.`)

        ctx.status = 201
        ctx.body = { result: await this.model.create(encounter) }
    }
}
