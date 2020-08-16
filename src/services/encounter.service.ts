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
        await this.validateTitleDoesNotExist(encounterParams, _id)

        encounter.set(encounterParams)
        return encounter.save()
    }

    public async replaceOrCreateEncounter(_id: string, newEncounter: Encounter): Promise<Encounter & Document> {
        validateMongoID(_id)
        await this.validateTitleDoesNotExist(newEncounter, _id)

        return this.model.findOneAndUpdate({ _id }, newEncounter, {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
        })
    }

    public async removeEncounter(_id: string): Promise<Encounter & Document> {
        validateMongoID(_id)
        await validateIdExistsInModel(_id, this.model)
        return this.model.findByIdAndRemove(_id)
    }

    private async validateTitleDoesNotExist(
        params: EncounterCreationParams | EncounterPatchParams | Encounter,
        excludeId = '',
    ): Promise<void> {
        const { title } = params

        if (!title) {
            return
        }

        const query = excludeId ? { title, _id: { $ne: excludeId } } : { title }
        const encounterAlreadyExists = Boolean(await this.model.findOne(query).exec())
        if (encounterAlreadyExists) {
            throw Boom.badRequest(`An encounter with the title "${title}" already exists.`)
        }
    }
}
