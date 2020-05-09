import { Model, Document } from 'mongoose'
import EncounterModel, { Encounter } from '../models/encounter.model'

export type EncounterCreationParams = Pick<Encounter, 'title' | 'description' | 'actions'>

export class EncounterService {
    private model: Model<Encounter & Document>

    constructor(model = EncounterModel()) {
        this.model = model
    }

    public createEncounter(encounterParams: EncounterCreationParams): Promise<Encounter> {
        return this.model.create(encounterParams)
    }
}
