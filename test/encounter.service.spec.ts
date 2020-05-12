import { EncounterService } from '../src/services/encounter.service'
import EncounterModel, { EncounterCreationParams, Encounter } from '../src/models/encounter.model'
import DBConnector from '../src/database'
import env from '../src/environment'
import * as mongoose from 'mongoose'
import * as Boom from '@hapi/boom'

beforeAll(async () => {
    const url = new DBConnector().setDB(env.mongo.testDb).buildMongoURL()
    mongoose.set('useCreateIndex', true)
    await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
})

beforeEach(async () => {
    await EncounterModel().deleteMany({})
})

afterAll(async () => {
    await mongoose.disconnect()
})

const model = EncounterModel()

const createFakeEncounter = (
    title = `Title_${Math.random()}`,
    description = `Desc_${Math.random()}`,
): Promise<Encounter> => {
    return model.create({
        title,
        description,
    } as Encounter)
}

describe('encounter service', () => {
    describe('createEncounter', () => {
        test('happy path - returns created encounter', async () => {
            const expected: EncounterCreationParams = {
                title: `Title_${Math.random()}`,
                description: `Description_${Math.random()}`,
            }
            const service = new EncounterService()

            const actual = await service.createEncounter(expected)

            expect(actual.title).toBe(expected.title)
            expect(actual.description).toBe(expected.description)
            expect(actual.actions).toBeDefined()
            expect(actual.actions.length).toBe(0)
            expect(actual.numberOfRuns).toBe(0)
        })

        test('throws a BadRequest error when given a title that already exists in the database', async () => {
            const encounterParams: EncounterCreationParams = {
                title: `Title_${Math.random()}`,
                description: `Description_${Math.random()}`,
            }
            await createFakeEncounter(encounterParams.title, encounterParams.description)
            const errorMessage = `An encounter with the title "${encounterParams.title}" already exists.`
            const expectedError = Boom.badRequest(errorMessage)

            const service = new EncounterService()

            await expect(service.createEncounter(encounterParams)).rejects.toThrow(expectedError)
        })
    })
})
