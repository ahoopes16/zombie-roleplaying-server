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
        await this.validateEncounterRequestBody(encounter, ctx)

        // TODO Maybe extract this to a service?
        const encounterWithSameTitle = Boolean(await this.model.findOne({ title: encounter.title }).exec())
        ctx.assert(!encounterWithSameTitle, 400, `An encounter with the title ${encounter.title} already exists.`)

        ctx.status = 201
        ctx.body = { result: await this.model.create(encounter) }
    }

    /** Inspect a specific encounter document by providing the Mongo ID */
    public inspectEncounter: Koa.Middleware = async ctx => {
        const { id } = ctx.params
        ctx.assert(isValidObjectId(id), 404, `ID must be a valid Mongo ObjectID. Received ${id}`)

        const encounter = await this.model.findById(id)
        ctx.assert(Boolean(encounter), 404, `No encounter found with ID ${id}`)

        ctx.status = 200
        ctx.body = { result: encounter }
    }

    /**
     * Update an encounter with the given Mongo ID. Must provide full object definition.
     * Will create the given document if it does not exist.
     */
    public updateEncounter: Koa.Middleware = async ctx => {
        const _id = ctx.params.id
        const encounter = ctx.request.body
        ctx.assert(isValidObjectId(_id), 404, `ID must be a valid Mongo ObjectID. Received ${_id}`)
        await this.validateEncounterRequestBody(encounter, ctx)

        const foundEncounter = await this.model.findById(_id)

        if (foundEncounter) {
            foundEncounter.overwrite(encounter)
            await foundEncounter.save()
            ctx.status = 200
        } else {
            const encounterWithSameTitle = Boolean(await this.model.findOne({ title: encounter.title }).exec())
            ctx.assert(!encounterWithSameTitle, 400, `An encounter with the title ${encounter.title} already exists.`)

            await this.model.create({ _id, ...encounter })
            ctx.status = 201
        }

        ctx.body = { result: await this.model.findById(_id) }
    }

    /** Patch an encounter with the given Mongo ID. Only provide the values that you want to be changed */
    public patchEncounter: Koa.Middleware = async ctx => {
        const { id } = ctx.params
        const encounter = ctx.request.body
        ctx.assert(isValidObjectId(id), 404, `ID must be a valid Mongo ObjectID. Received ${id}`)

        const foundEncounter = await this.model.findById(id)
        ctx.assert(Boolean(foundEncounter), 404, `No encounter found with ID ${id}`)

        if (encounter.title) {
            const encounterWithSameTitle = Boolean(await this.model.findOne({ title: encounter.title }).exec())
            ctx.assert(!encounterWithSameTitle, 400, `An encounter with the title ${encounter.title} already exists.`)
        }

        foundEncounter.set(ctx.request.body)

        ctx.status = 200
        ctx.body = { result: await foundEncounter.save() }
    }

    /** Delete an encounter document with the given Mongo ID */
    public deleteEncounter: Koa.Middleware = async ctx => {
        const { id } = ctx.params
        ctx.assert(isValidObjectId(id), 404, `ID must be a valid Mongo ObjectID. Received ${id}`)

        const deletedEncounter = await this.model.findByIdAndDelete(id)
        ctx.assert(Boolean(deletedEncounter), 404, `No encounter found with ID ${id}`)

        ctx.status = 200
        ctx.body = { result: deletedEncounter }
    }

    /** Validate that all of the fields provided match the Encounter model */
    private async validateEncounterRequestBody(encounter: any, ctx: Koa.Context): Promise<void> {
        const hasProperTitle = Boolean(encounter.title && typeof encounter.title === 'string')
        ctx.assert(hasProperTitle, 400, 'An encounter requires a title property of type string.')

        const hasProperDescription = Boolean(encounter.description && typeof encounter.description === 'string')
        ctx.assert(hasProperDescription, 400, 'An encounter requires a description property of type string.')

        if (encounter.numberOfRuns) {
            ctx.assert(typeof encounter.numberOfRuns === 'number', 400, "'numberOfRuns' property must be a number")
        }

        if (encounter.actions) {
            const hasProperActions =
                Array.isArray(encounter.actions) && encounter.actions.every((a: unknown) => typeof a === 'string')
            ctx.assert(hasProperActions, 400, "'actions' property must be an array of strings")
        }
    }
}
