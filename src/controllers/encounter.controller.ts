import * as Koa from 'koa'
import { Model, isValidObjectId } from 'mongoose'
import EncounterModel, { Encounter } from '../models/encounter.model'

export class EncounterController {
    private model: Model<Encounter>

    constructor(model = EncounterModel()) {
        this.model = model
    }

    /** Retrieve a list of all encounter documents */
    public getEncounters: Koa.Middleware = async ctx => {
        // TODO Add pagination/result limits
        ctx.status = 200
        ctx.body = { result: await this.model.find().exec() }
    }

    /** Create a new encounter document */
    public createEncounter: Koa.Middleware = async ctx => {
        const encounter = ctx.request.body

        // TODO Maybe extract these out to a service?
        const hasProperTitle = Boolean(encounter.title && typeof encounter.title === 'string')
        ctx.assert(hasProperTitle, 400, 'An encounter requires a title property of type string.')

        const hasProperDescription = Boolean(encounter.description && typeof encounter.description === 'string')
        ctx.assert(hasProperDescription, 400, 'An encounter requires a description property of type string.')

        const encounterWithSameTitle = Boolean(await this.model.findOne({ title: encounter.title }).exec())
        ctx.assert(!encounterWithSameTitle, 400, `An encounter with the title ${encounter.title} already exists.`)

        ctx.status = 201
        ctx.body = { result: await this.model.create(encounter) }
    }

    /** Inspect a specific encounter document by providing the Mongo ID */
    public inspectEncounter: Koa.Middleware = async ctx => {
        const { id } = ctx.params
        ctx.assert(isValidObjectId(id), 400, `ID must be a valid Mongo ObjectID. Received ${id}`)

        const encounter = await this.model.findById(id)

        ctx.assert(Boolean(encounter), 404, `No encounter found with ID ${id}`)

        ctx.status = 200
        ctx.body = { result: encounter }
    }

    /** Delete an encounter document with the given Mongo ID */
    public deleteEncounter: Koa.Middleware = async ctx => {
        const { id } = ctx.params
        ctx.assert(isValidObjectId(id), 400, `ID must be a valid Mongo ObjectID. Received ${id}`)

        const deletedEncounter = await this.model.findByIdAndDelete(id)
        ctx.assert(Boolean(deletedEncounter), 404, `No encounter found with ID ${id}`)

        ctx.status = 200
        ctx.body = { result: deletedEncounter }
    }
}
