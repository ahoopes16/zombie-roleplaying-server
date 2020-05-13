import { Model, Document } from 'mongoose'
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

    public async createEncounter(encounterParams: EncounterCreationParams): Promise<Encounter> {
        const { title } = encounterParams

        const encounterAlreadyExists = Boolean(await this.model.findOne({ title }).exec())
        if (encounterAlreadyExists) {
            throw Boom.badRequest(`An encounter with the title "${title}" already exists.`)
        }

        return this.model.create(encounterParams)
    }
}
