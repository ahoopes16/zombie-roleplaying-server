import { EncounterService } from '../../src/services/encounter.service'
import EncounterModel, {
    EncounterCreationParams,
    EncounterPatchParams,
    Encounter,
} from '../../src/models/encounter.model'
import { createFakeEncounter } from '../helpers/encounter.helper'
import DBConnector from '../../src/database'
import env from '../../src/environment'
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

const notFoundError = (id: string): Boom.Boom => {
    return Boom.notFound(`Item with ID "${id}" not found.`)
}

const invalidMongoIDError = (id: string): Boom.Boom => {
    return Boom.badRequest(`Invalid encounter ID. Please give a valid Mongo ObjectID. Received "${id}".`)
}

const titleExistsError = (title: string): Boom.Boom => {
    return Boom.badRequest(`An encounter with the title "${title}" already exists.`)
}

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
            const expectedError = invalidMongoIDError(invalidId)

            const service = new EncounterService()

            await expect(service.inspectEncounter(invalidId)).rejects.toThrow(expectedError)
        })

        test('throws a NotFound error when given a valid Mongo ID that does not exist', async () => {
            const mongoId = new ObjectId().toString()
            const expectedError = notFoundError(mongoId)

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
            const expectedError = titleExistsError(encounterParams.title)

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
            const expectedError = invalidMongoIDError(invalidId)

            await expect(service.partiallyUpdateEncounter(invalidId, updateParams)).rejects.toThrow(expectedError)
        })

        test('throws a NotFound error when given a valid Mongo ID that does not exist', async () => {
            const id = new ObjectId().toString()
            const service = new EncounterService()
            const updateParams: EncounterPatchParams = {
                description: `Desc_${Math.random()}`,
            }
            const expectedError = notFoundError(id)

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
            const expectedError = titleExistsError(encounterOneParams.title)
            const service = new EncounterService()

            await expect(service.partiallyUpdateEncounter(encounterTwo._id, updateEncounterParams)).rejects.toThrow(
                expectedError,
            )
        })
    })

    describe('replaceEncounter', () => {
        test('happy path - updates encounter if Mongo ID exists', async () => {
            const encounterParams: EncounterCreationParams = {
                title: `Title_${Math.random()}`,
                description: `Desc_${Math.random()}`,
            }
            const original = await createFakeEncounter(model, encounterParams)
            const service = new EncounterService()
            const updateParams: Encounter = {
                title: `Title_${Math.random()}`,
                description: `Desc_${Math.random()}`,
                actions: [],
                numberOfRuns: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
                __v: 2,
            }

            const updated = await service.replaceEncounter(original._id, updateParams)

            expect(updated._id).toStrictEqual(original._id)
            expect(updated.title).toBe(updateParams.title)
            expect(updated.description).toBe(updateParams.description)
            expect(updated.numberOfRuns).toBe(updateParams.numberOfRuns)
            expect(updated.__v).toBe(updateParams.__v)
        })

        test('happy path - creates encounter if Mongo ID is valid but does not exist', async () => {
            const service = new EncounterService()
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

            const created = await service.replaceEncounter(id, updateParams)

            expect(created._id.toString()).toBe(id)
            expect(created.title).toBe(updateParams.title)
            expect(created.description).toBe(updateParams.description)
            expect(created.numberOfRuns).toBe(updateParams.numberOfRuns)
            expect(created.__v).toBe(updateParams.__v)
        })

        test('throws a BadRequest error when given an invalid Mongo ID', async () => {
            const invalidId = `invalid-id-${Math.random()}`
            const service = new EncounterService()
            const updateParams: Encounter = {
                title: `Title_${Math.random()}`,
                description: `Desc_${Math.random()}`,
                actions: [],
                numberOfRuns: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
                __v: 2,
            }
            const expectedError = invalidMongoIDError(invalidId)

            await expect(service.replaceEncounter(invalidId, updateParams)).rejects.toThrow(expectedError)
        })

        test('throws a BadRequest error when given a title that already exists in the database', async () => {
            const encounterParams: EncounterCreationParams = {
                title: `Title_${Math.random()}`,
                description: `Description_${Math.random()}`,
            }
            const encounter = await createFakeEncounter(model, encounterParams)
            const updateParams: Encounter = {
                title: encounter.title,
                description: `Desc_${Math.random()}`,
                actions: [],
                numberOfRuns: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
                __v: 2,
            }
            const expectedError = titleExistsError(encounterParams.title)

            const service = new EncounterService()

            await expect(service.replaceEncounter(encounter._id, updateParams)).rejects.toThrow(expectedError)
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
            const expectedError = invalidMongoIDError(invalidId)

            await expect(service.deleteEncounter(invalidId)).rejects.toThrow(expectedError)
        })

        test('throws a NotFound error when given a valid Mongo ID that does not exist', async () => {
            const mongoId = new ObjectId().toString()
            const expectedError = notFoundError(mongoId)
            const service = new EncounterService()

            await expect(service.deleteEncounter(mongoId)).rejects.toThrow(expectedError)
        })
    })
})
