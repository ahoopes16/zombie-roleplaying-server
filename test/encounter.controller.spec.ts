import { EncounterController } from '../src/controllers/encounter.controller'
import EncounterModel, { EncounterCreationParams } from '../src/models/encounter.model'
import DBConnector from '../src/database'
import env from '../src/environment'
import * as mongoose from 'mongoose'

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

describe('encounter controller', () => {
    describe('postEncounter', () => {
        test('happy path - returns created encounter inside result', async () => {
            const expected: EncounterCreationParams = {
                title: `Title_${Math.random()}`,
                description: `Description_${Math.random()}`,
            }
            const controller = new EncounterController()

            const actual = await controller.postEncounter(expected)

            expect(actual.result).toBeDefined()
            expect(actual.result.title).toBe(expected.title)
            expect(actual.result.description).toBe(expected.description)
            expect(actual.result.actions).toBeDefined()
            expect(actual.result.actions.length).toBe(0)
        })
    })
})
