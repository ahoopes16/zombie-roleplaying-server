import EncounterModel, { Encounter, EncounterCreationParams, EncounterPatchParams } from '../models/encounter.model'
import { Model, Document } from 'mongoose'
import { validateMongoID, validateIdExistsInModel } from '../util/database.util'
import * as Boom from '@hapi/boom'

export class EncounterService {
    private model: Model<Encounter & Document>

    constructor(model = EncounterModel()) {
        this.model = model
    }

    public listEncounters(): Promise<Array<Encounter & Document>> {
        return this.model.find().exec()
    }

    public async inspectEncounter(_id: string): Promise<Encounter & Document> {
        validateMongoID(_id)
        const encounter = await validateIdExistsInModel(_id, this.model)
        return encounter
    }

    public async createEncounter(encounterParams: EncounterCreationParams): Promise<Encounter & Document> {
        await this.validateTitleDoesNotExist(encounterParams)
        return this.model.create(encounterParams)
    }

    public async partiallyUpdateEncounter(
        _id: string,
        encounterParams: EncounterPatchParams,
    ): Promise<Encounter & Document> {
        validateMongoID(_id)
        const encounter = await validateIdExistsInModel(_id, this.model)
        await this.validateTitleDoesNotExist(encounterParams)

        encounter.set(encounterParams)
        return encounter.save()
    }

    public async replaceEncounter(_id: string, newEncounter: Encounter): Promise<Encounter & Document> {
        validateMongoID(_id)
        await this.validateTitleDoesNotExist(newEncounter)

        return this.model.findOneAndUpdate({ _id }, newEncounter, {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
        })
    }

    public async deleteEncounter(_id: string): Promise<Encounter & Document> {
        validateMongoID(_id)
        await validateIdExistsInModel(_id, this.model)
        return this.model.findByIdAndRemove(_id)
    }

    private async validateTitleDoesNotExist(
        params: EncounterCreationParams | EncounterPatchParams | Encounter,
    ): Promise<void> {
        const { title } = params

        if (!title) {
            return
        }

        const encounterAlreadyExists = Boolean(await this.model.findOne({ title }).exec())
        if (encounterAlreadyExists) {
            throw Boom.badRequest(`An encounter with the title "${title}" already exists.`)
        }
    }
}
