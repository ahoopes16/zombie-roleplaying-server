import { Model, Document } from 'mongoose'
import EncounterModel, { Encounter, EncounterCreationParams } from '../../src/models/encounter.model'

const defaultEncounterParams: EncounterCreationParams = {
    title: `Title_${Math.random()}`,
    description: `Desc_${Math.random()}`,
}

export const createFakeEncounter = (
    model: Model<Encounter & Document> = EncounterModel(),
    encounterParams: EncounterCreationParams = defaultEncounterParams,
): Promise<Encounter> => {
    return model.create(encounterParams)
}
