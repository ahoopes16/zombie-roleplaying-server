import { Model, Document, isValidObjectId } from 'mongoose'
import EncounterModel, { Encounter, EncounterCreationParams } from '../models/encounter.model'
import * as Boom from '@hapi/boom'

export class EncounterService {
    private model: Model<Encounter & Document>

    constructor(model = EncounterModel()) {
        this.model = model
    }

    public listEncounters(): Promise<Encounter[]> {
        return this.model.find().exec()
    }

    public async inspectEncounter(_id: string): Promise<Encounter & Document> {
        if (!isValidObjectId(_id)) {
            throw Boom.badRequest(`Invalid encounter ID. Please give a valid Mongo ObjectID. Received "${_id}".`)
        }

        const encounter = await this.model.findOne({ _id }).exec()
        if (!encounter) {
            throw Boom.notFound(`Encounter with ID "${_id}" not found.`)
        }

        return encounter
    }

    public async createEncounter(encounterParams: EncounterCreationParams): Promise<Encounter & Document> {
        const { title } = encounterParams

        const encounterAlreadyExists = Boolean(await this.model.findOne({ title }).exec())
        if (encounterAlreadyExists) {
            throw Boom.badRequest(`An encounter with the title "${title}" already exists.`)
        }

        return this.model.create(encounterParams)
    }
}
