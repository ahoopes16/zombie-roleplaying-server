import { Model, Document, isValidObjectId } from 'mongoose'
import EncounterModel, { Encounter, EncounterCreationParams, EncounterPatchParams } from '../models/encounter.model'
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
        this.validateMongoID(_id)
        const encounter = await this.validateEncounterExists(_id)
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
        this.validateMongoID(_id)
        const encounter = await this.validateEncounterExists(_id)
        await this.validateTitleDoesNotExist(encounterParams)

        encounter.set(encounterParams)
        return encounter.save()
    }

    private async validateEncounterExists(_id: string): Promise<Encounter & Document> {
        const encounter = await this.model.findOne({ _id }).exec()
        if (!encounter) {
            throw Boom.notFound(`Encounter with ID "${_id}" not found.`)
        }

        return encounter
    }

    private validateMongoID(id: string): void {
        if (!isValidObjectId(id)) {
            throw Boom.badRequest(`Invalid encounter ID. Please give a valid Mongo ObjectID. Received "${id}".`)
        }
    }

    private async validateTitleDoesNotExist(params: EncounterCreationParams | EncounterPatchParams): Promise<void> {
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
