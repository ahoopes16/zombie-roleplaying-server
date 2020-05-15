import { EncounterController } from '../src/controllers/encounter.controller'
import EncounterModel, { EncounterCreationParams, EncounterPatchParams, Encounter } from '../src/models/encounter.model'
import { createFakeEncounter } from './helpers/encounter.helper'
import { ObjectId } from 'mongodb'
import DBConnector from '../src/database'
import env from '../src/environment'
import * as mongoose from 'mongoose'

beforeAll(async () => {
    const url = new DBConnector().setDB(env.mongo.testDb).buildMongoURL()
    mongoose.set('useCreateIndex', true)
    mongoose.set('useFindAndModify', false)
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
        test('returns empty array if there are no encounters', async () => {
            const controller = new EncounterController()

            const actual = await controller.getEncounters()

            expect(actual.result).toBeDefined()
            expect(actual.result.length).toBe(0)
        })

        test('returns array of encounters inside result', async () => {
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

    describe('getEncounter', () => {
        test('returns desired encounter', async () => {
            const controller = new EncounterController()
            const encounterParams: EncounterCreationParams = {
                title: `Title_${Math.random()}`,
                description: `Description_${Math.random()}`,
            }
            const expected = await createFakeEncounter(model, encounterParams)

            const actual = await controller.getEncounter(expected._id)

            expect(actual.result).toBeDefined()
            expect(actual.result.title).toBe(expected.title)
            expect(actual.result.description).toBe(expected.description)
        })
    })

    describe('postEncounter', () => {
        test('returns created encounter inside result', async () => {
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

    describe('patchEncounter', () => {
        test('returns updated encounter inside result', async () => {
            const originalParams: EncounterCreationParams = {
                title: `Title_${Math.random()}`,
                description: `Description_${Math.random()}`,
            }
            const original = await createFakeEncounter(model, originalParams)
            const updateParams: EncounterPatchParams = {
                description: `Description_${Math.random()}`,
            }
            const controller = new EncounterController()

            const updated = await controller.patchEncounter(original._id, updateParams)

            expect(updated.result).toBeDefined
            expect(updated.result.title).toBe(original.title)
            expect(updated.result.description).toBe(updateParams.description)
            expect(updated.result.description).not.toBe(original.description)
        })
    })

    describe('putEncounter', () => {
        test('returns updated encounter inside result', async () => {
            const originalParams: EncounterCreationParams = {
                title: `Title_${Math.random()}`,
                description: `Description_${Math.random()}`,
            }
            const original = await createFakeEncounter(model, originalParams)
            const updateParams: Encounter = {
                title: `Title_${Math.random()}`,
                description: `Desc_${Math.random()}`,
                actions: [],
                numberOfRuns: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
                __v: 2,
            }
            const controller = new EncounterController()

            const updated = await controller.putEncounter(original._id, updateParams)

            expect(updated.result).toBeDefined
            expect(updated.result.title).toBe(updateParams.title)
            expect(updated.result.title).not.toBe(original.title)
            expect(updated.result.description).toBe(updateParams.description)
            expect(updated.result.description).not.toBe(original.description)
        })

        test('returns created encounter inside result', async () => {
            const id = new ObjectId().toString()
            const updateParams: Encounter = {
                title: `Title_${Math.random()}`,
                description: `Desc_${Math.random()}`,
                actions: [],
                numberOfRuns: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
                __v: 2,
            }
            const controller = new EncounterController()

            const updated = await controller.putEncounter(id, updateParams)

            expect(updated.result).toBeDefined
            expect(updated.result.title).toBe(updateParams.title)
            expect(updated.result.description).toBe(updateParams.description)
        })
    })

    describe('deleteEncounter', () => {
        test('returns deleted encounter inside result', async () => {
            const controller = new EncounterController()
            const encounterParams: EncounterCreationParams = {
                title: `Title_${Math.random()}`,
                description: `Description_${Math.random()}`,
            }
            const expected = await createFakeEncounter(model, encounterParams)

            const actual = await controller.deleteEncounter(expected._id)

            expect(actual.result).toBeDefined()
            expect(actual.result.title).toBe(expected.title)
            expect(actual.result.description).toBe(expected.description)
        })
    })
})
