import { EncounterService } from '../src/services/encounter.service'
import EncounterModel, { EncounterCreationParams, EncounterPatchParams } from '../src/models/encounter.model'
import { createFakeEncounter } from './helpers/encounter.helper'
import DBConnector from '../src/database'
import env from '../src/environment'
import { ObjectId } from 'mongodb'
import * as mongoose from 'mongoose'
import * as Boom from '@hapi/boom'

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

describe('encounter service', () => {
    describe('listEncounters', () => {
        test('happy path - returns list of encounters', async () => {
            const service = new EncounterService()
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

            const actual = await service.listEncounters()

            expect(actual).toBeDefined()
            expect(actual.length).toBe(2)
            expect(actual.find(encounter => encounter.title === encounterOne.title)).toBeTruthy()
            expect(actual.find(encounter => encounter.title === encounterTwo.title)).toBeTruthy()
        })
    })

    describe('inspectEncounter', () => {
        test('happy path - return encounter', async () => {
            const service = new EncounterService()
            const encounterParams: EncounterCreationParams = {
                title: `Title_${Math.random()}`,
                description: `Description_${Math.random()}`,
            }

            const expected = await createFakeEncounter(model, encounterParams)

            const actual = await service.inspectEncounter(expected._id)

            expect(actual).toBeTruthy()
            expect(actual._id).toStrictEqual(expected._id)
            expect(actual.title).toBe(expected.title)
            expect(actual.description).toBe(expected.description)
        })

        test('throws a BadRequest error when given an invalid Mongo ID', async () => {
            const invalidId = `invalid-id-${Math.random()}`
            const errorMessage = `Invalid encounter ID. Please give a valid Mongo ObjectID. Received "${invalidId}".`
            const expectedError = Boom.badRequest(errorMessage)

            const service = new EncounterService()

            await expect(service.inspectEncounter(invalidId)).rejects.toThrow(expectedError)
        })

        test('throws a NotFound error when given a valid Mongo ID that does not exist', async () => {
            const mongoId = new ObjectId().toString()
            const errorMessage = `Encounter with ID "${mongoId}" not found.`
            const expectedError = Boom.notFound(errorMessage)

            const service = new EncounterService()

            await expect(service.inspectEncounter(mongoId)).rejects.toThrow(expectedError)
        })
    })

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
            await createFakeEncounter(model, encounterParams)
            const errorMessage = `An encounter with the title "${encounterParams.title}" already exists.`
            const expectedError = Boom.badRequest(errorMessage)

            const service = new EncounterService()

            await expect(service.createEncounter(encounterParams)).rejects.toThrow(expectedError)
        })
    })

    describe('partiallyUpdateEncounter', () => {
        test('happy path - returns updated encounter', async () => {
            const encounterParams: EncounterCreationParams = {
                title: `Title_${Math.random()}`,
                description: `Desc_${Math.random()}`,
            }
            const original = await createFakeEncounter(model, encounterParams)
            const service = new EncounterService()
            const updateParams: EncounterPatchParams = {
                description: `Desc_${Math.random()}`,
            }

            const updated = await service.partiallyUpdateEncounter(original._id, updateParams)

            expect(updated._id).toStrictEqual(original._id)
            expect(updated.title).toBe(original.title)
            expect(updated.description).toBe(updateParams.description)
        })

        test('throws a BadRequest error when given an invalid Mongo ID', async () => {
            const invalidId = `invalid-id-${Math.random()}`
            const service = new EncounterService()
            const updateParams: EncounterPatchParams = {
                description: `Desc_${Math.random()}`,
            }
            const errorMessage = `Invalid encounter ID. Please give a valid Mongo ObjectID. Received "${invalidId}".`
            const expectedError = Boom.badRequest(errorMessage)

            await expect(service.partiallyUpdateEncounter(invalidId, updateParams)).rejects.toThrow(expectedError)
        })

        test('throws a NotFound error when given a valid Mongo ID that does not exist', async () => {
            const id = new ObjectId().toString()
            const service = new EncounterService()
            const updateParams: EncounterPatchParams = {
                description: `Desc_${Math.random()}`,
            }
            const errorMessage = `Encounter with ID "${id}" not found.`
            const expectedError = Boom.notFound(errorMessage)

            await expect(service.partiallyUpdateEncounter(id, updateParams)).rejects.toThrow(expectedError)
        })

        test('throws a BadRequest error when given a title that already exists in the database', async () => {
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
            const updateEncounterParams: EncounterPatchParams = {
                title: encounterOne.title,
            }
            const errorMessage = `An encounter with the title "${encounterOneParams.title}" already exists.`
            const expectedError = Boom.badRequest(errorMessage)
            const service = new EncounterService()

            await expect(service.partiallyUpdateEncounter(encounterTwo._id, updateEncounterParams)).rejects.toThrow(
                expectedError,
            )
        })
    })

    describe('deleteEncounter', () => {
        test('happy path - removes encounter from database', async () => {
            const service = new EncounterService()
            const encounterParams: EncounterCreationParams = {
                title: `Title_${Math.random()}`,
                description: `Description_${Math.random()}`,
            }

            const expected = await createFakeEncounter(model, encounterParams)
            const actual = await service.deleteEncounter(expected._id)
            const afterRemoval = await model.findById(actual._id)

            expect(afterRemoval).toBeFalsy()
        })

        test('happy path - returns deleted encounter', async () => {
            const service = new EncounterService()
            const encounterParams: EncounterCreationParams = {
                title: `Title_${Math.random()}`,
                description: `Description_${Math.random()}`,
            }

            const expected = await createFakeEncounter(model, encounterParams)

            const actual = await service.deleteEncounter(expected._id)

            expect(actual).toBeTruthy()
            expect(actual._id).toStrictEqual(expected._id)
            expect(actual.title).toBe(expected.title)
            expect(actual.description).toBe(expected.description)
        })

        test('throws a BadRequest error when given an invalid Mongo ID', async () => {
            const invalidId = `invalid-id-${Math.random()}`
            const service = new EncounterService()
            const errorMessage = `Invalid encounter ID. Please give a valid Mongo ObjectID. Received "${invalidId}".`
            const expectedError = Boom.badRequest(errorMessage)

            await expect(service.deleteEncounter(invalidId)).rejects.toThrow(expectedError)
        })

        test('throws a NotFound error when given a valid Mongo ID that does not exist', async () => {
            const mongoId = new ObjectId().toString()
            const errorMessage = `Encounter with ID "${mongoId}" not found.`
            const expectedError = Boom.notFound(errorMessage)

            const service = new EncounterService()

            await expect(service.deleteEncounter(mongoId)).rejects.toThrow(expectedError)
        })
    })
})
