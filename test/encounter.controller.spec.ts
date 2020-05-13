import { EncounterController } from '../src/controllers/encounter.controller'
import EncounterModel, { EncounterCreationParams } from '../src/models/encounter.model'
import { createFakeEncounter } from './helpers/encounter.helper'
import DBConnector from '../src/database'
import env from '../src/environment'
import * as mongoose from 'mongoose'
import { Controller } from 'tsoa'

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
    describe('getEncounters', () => {
        test('happy path - returns empty array if there are no encounters', async () => {
            const controller = new EncounterController()

            const actual = await controller.getEncounters()

            expect(actual.result).toBeDefined()
            expect(actual.result.length).toBe(0)
        })

        test('happy path - returns array of encounters inside result', async () => {
            const controller = new EncounterController()
            const encounterOneParams: EncounterCreationParams = {
                title: `Title_${Math.random()}`,
                description: `Description_${Math.random()}`,
            }
            const encounterTwoParams: EncounterCreationParams = {
                title: `Title_${Math.random()}`,
                description: `Description_${Math.random()}`,
            }
            const encounterOne = await createFakeEncounter(model, encounterOneParams)
            const encounterTwo = await createFakeEncounter(model, encounterTwoParams)

            const actual = await controller.getEncounters()

            expect(actual.result).toBeDefined()
            expect(actual.result.length).toBe(2)
            expect(actual.result.find(encounter => encounter.title === encounterOne.title)).toBeTruthy()
            expect(actual.result.find(encounter => encounter.title === encounterTwo.title)).toBeTruthy()
        })
    })

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
