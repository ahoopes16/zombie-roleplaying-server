import { EncounterController } from '../src/controllers/encounter.controller'
import EncounterModel from '../src/models/encounter.model'
import DBConnector from '../src/database'
import env from '../src/environment'
import * as mongoose from 'mongoose'
import { fakeKoaContext, fakeKoaNext } from './helpers/koa.helper'

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
        test('returns a status of 200', async () => {
            const controller = new EncounterController(model)
            const ctx = fakeKoaContext()

            await controller.getEncounters(ctx, fakeKoaNext)

            expect(ctx.status).toBe(200)
        })

        test('returns an empty array as the result when no encounters exist', async () => {
            const controller = new EncounterController(model)
            const ctx = fakeKoaContext()

            await controller.getEncounters(ctx, fakeKoaNext)

            expect(ctx.body.result).toBeTruthy()
            expect(ctx.body.result.length).toBe(0)
        })

        test('returns array of encounters when they exist', async () => {
            const controller = new EncounterController(model)
            const ctx = fakeKoaContext()

            const numberOfEncounters = 3
            for (let i = 0; i < numberOfEncounters; i++) {
                await model.create({
                    title: `RandomTitle_${Math.random()}`,
                    description: `RandomDescription_${Math.random()}`,
                })
            }

            await controller.getEncounters(ctx, fakeKoaNext)

            expect(ctx.body.result).toBeTruthy()
            expect(ctx.body.result.length).toBe(numberOfEncounters)
        })
    })

    describe('createEncounter', () => {
        test('creates encounter when the request body is valid', async () => {
            const controller = new EncounterController(model)

            const newEncounterRequestBody = {
                title: `RandomTitle_${Math.random()}`,
                description: `RandomDescription_${Math.random()}`,
                actions: [`RandomAction_${Math.random()}`],
            }
            const ctx = fakeKoaContext(newEncounterRequestBody)

            await controller.createEncounter(ctx, fakeKoaNext)

            const actual = await model.findById(ctx.body.result._id)
            expect(actual.title).toBe(newEncounterRequestBody.title)
            expect(actual.description).toBe(newEncounterRequestBody.description)
            expect(actual.actions.length).toBe(newEncounterRequestBody.actions.length)
        })

        test('returns a 201 when encounter is successfully created', async () => {
            const controller = new EncounterController(model)

            const newEncounterRequestBody = {
                title: `RandomTitle_${Math.random()}`,
                description: `RandomDescription_${Math.random()}`,
                actions: [`RandomAction_${Math.random()}`],
            }
            const ctx = fakeKoaContext(newEncounterRequestBody)

            await controller.createEncounter(ctx, fakeKoaNext)
            expect(ctx.status).toBe(201)
        })

        test('returns a body with the created encounter', async () => {
            const controller = new EncounterController(model)

            const newEncounterRequestBody = {
                title: `RandomTitle_${Math.random()}`,
                description: `RandomDescription_${Math.random()}`,
                actions: [`RandomAction_${Math.random()}`],
            }
            const ctx = fakeKoaContext(newEncounterRequestBody)

            await controller.createEncounter(ctx, fakeKoaNext)

            const { title, description, actions } = ctx.body.result
            expect(title).toBe(newEncounterRequestBody.title)
            expect(description).toBe(newEncounterRequestBody.description)
            expect(actions.length).toBe(newEncounterRequestBody.actions.length)
        })

        test('returns a 400 when title does not exist on request body', async () => {
            const controller = new EncounterController(model)

            const newEncounterRequestBody = {
                description: 'Test Description',
            }
            const ctx = fakeKoaContext(newEncounterRequestBody)

            try {
                await controller.createEncounter(ctx, fakeKoaNext)
            } catch (error) {
                const msg = 'An encounter requires a title property of type string.'
                expect(ctx.assert).toBeCalledWith(false, 400, msg)
                return
            }

            // Should not have reached this line
            expect(true).toBe(false)
        })

        test('returns a 400 when title is not a string', async () => {
            const controller = new EncounterController(model)

            const newEncounterRequestBody = {
                title: 0,
                description: 'Test Description',
            }
            const ctx = fakeKoaContext(newEncounterRequestBody)

            try {
                await controller.createEncounter(ctx, fakeKoaNext)
            } catch (error) {
                const msg = 'An encounter requires a title property of type string.'
                expect(ctx.assert).toBeCalledWith(false, 400, msg)
                return
            }

            // Should not have reached this line
            expect(true).toBe(false)
        })

        test('returns a 400 when the title already exists on an encounter in the database', async () => {
            const controller = new EncounterController(model)

            const newEncounterRequestBody = {
                title: `RandomTitle_${Math.random()}`,
                description: `RandomDescription_${Math.random()}`,
            }
            const ctx = fakeKoaContext(newEncounterRequestBody)

            await model.create(newEncounterRequestBody)

            try {
                await controller.createEncounter(ctx, fakeKoaNext)
            } catch (error) {
                const msg = `An encounter with the title ${newEncounterRequestBody.title} already exists.`
                expect(ctx.assert).toBeCalledWith(false, 400, msg)
                return
            }

            // Should not have reached this line
            expect(true).toBe(false)
        })

        test('returns a 400 when description does not exist on request body', async () => {
            const controller = new EncounterController(model)

            const newEncounterRequestBody = {
                title: 'Test Title',
            }
            const ctx = fakeKoaContext(newEncounterRequestBody)

            try {
                await controller.createEncounter(ctx, fakeKoaNext)
            } catch (error) {
                const msg = 'An encounter requires a description property of type string.'
                expect(ctx.assert).toBeCalledWith(false, 400, msg)
                return
            }

            // Should not have reached this line
            expect(true).toBe(false)
        })

        test('returns a 400 when description is not a string', async () => {
            const controller = new EncounterController(model)

            const newEncounterRequestBody = {
                title: 'Test Title',
                description: 0,
            }
            const ctx = fakeKoaContext(newEncounterRequestBody)

            try {
                await controller.createEncounter(ctx, fakeKoaNext)
            } catch (error) {
                const msg = 'An encounter requires a description property of type string.'
                expect(ctx.assert).toBeCalledWith(false, 400, msg)
                return
            }

            // Should not have reached this line
            expect(true).toBe(false)
        })

        test('returns a 400 when numberOfRuns is not a number', async () => {
            const controller = new EncounterController(model)

            const newEncounterRequestBody = {
                title: 'Test Title',
                description: 'Test Description',
                numberOfRuns: 'Clearly not a number',
            }
            const ctx = fakeKoaContext(newEncounterRequestBody)

            try {
                await controller.createEncounter(ctx, fakeKoaNext)
            } catch (error) {
                const msg = "'numberOfRuns' property must be a number"
                expect(ctx.assert).toBeCalledWith(false, 400, msg)
                return
            }

            // Should not have reached this line
            expect(true).toBe(false)
        })

        test('returns a 400 when actions is not an array of only strings', async () => {
            const controller = new EncounterController(model)

            const newEncounterRequestBody = {
                title: 'Test Title',
                description: 'Test Description',
                actions: [0, 1, `Actually a string`],
            }
            const ctx = fakeKoaContext(newEncounterRequestBody)

            try {
                await controller.createEncounter(ctx, fakeKoaNext)
            } catch (error) {
                const msg = "'actions' property must be an array of strings"
                expect(ctx.assert).toBeCalledWith(false, 400, msg)
                return
            }

            // Should not have reached this line
            expect(true).toBe(false)
        })
    })

    describe('inspectEncounter', () => {
        test('returns a 200 when the encounter is found', async () => {
            const controller = new EncounterController(model)

            const encounter = await model.create({
                title: `RandomTitle_${Math.random()}`,
                description: `RandomDescription_${Math.random}`,
            })
            const ctx = fakeKoaContext({}, { id: encounter._id })

            await controller.inspectEncounter(ctx, fakeKoaNext)

            expect(ctx.status).toBe(200)
        })

        test('returns the correct encounter document when it is found', async () => {
            const controller = new EncounterController(model)

            const encounter = await model.create({
                title: `RandomTitle_${Math.random()}`,
                description: `RandomDescription_${Math.random}`,
            })
            const ctx = fakeKoaContext({}, { id: encounter._id })

            await controller.inspectEncounter(ctx, fakeKoaNext)

            expect(ctx.body.result._id).toStrictEqual(encounter._id)
            expect(ctx.body.result.title).toBe(encounter.title)
            expect(ctx.body.result.description).toBe(encounter.description)
            expect(ctx.body.result.actions.length).toBe(encounter.actions.length)
        })

        test('returns a 404 when the given ID is not a valid Mongo ObjectID', async () => {
            const controller = new EncounterController(model)
            const params = { id: 'nonValidMongoObjectID' }
            const ctx = fakeKoaContext({}, params)

            try {
                await controller.inspectEncounter(ctx, fakeKoaNext)
            } catch (error) {
                const msg = `ID must be a valid Mongo ObjectID. Received ${params.id}`
                expect(ctx.assert).toBeCalledWith(false, 404, msg)
                return
            }

            // Should not have reached this line
            expect(true).toBe(false)
        })

        test('returns a 404 when the encounter with the given ID is not found', async () => {
            const controller = new EncounterController(model)
            const params = { id: new mongoose.mongo.ObjectID() }
            const ctx = fakeKoaContext({}, params)

            try {
                await controller.inspectEncounter(ctx, fakeKoaNext)
            } catch (error) {
                const msg = `No encounter found with ID ${params.id}`
                expect(ctx.assert).toBeCalledWith(false, 404, msg)
                return
            }

            // Should not have reached this line
            expect(true).toBe(false)
        })
    })

    describe('updateEncounter', () => {
        test('returns a 200 when the encounter is successfully updated', async () => {
            const controller = new EncounterController(model)

            const originalEncounterBody = {
                title: `RandomTitle_${Math.random()}`,
                description: `RandomDescription_${Math.random()}`,
            }
            const originalEncounter = await model.create(originalEncounterBody)

            const params = { id: originalEncounter._id }
            const updatedEncounterRequestBody = {
                title: originalEncounter.title,
                description: `NewRandomDescription_${Math.random()}`,
            }
            const ctx = fakeKoaContext(updatedEncounterRequestBody, params)

            await controller.updateEncounter(ctx, fakeKoaNext)

            expect(ctx.status).toBe(200)
        })

        test('returns the updated encounter document when the encounter is successfully updated', async () => {
            const controller = new EncounterController(model)

            const originalEncounterBody = {
                title: `RandomTitle_${Math.random()}`,
                description: `RandomDescription_${Math.random()}`,
            }
            const originalEncounter = await model.create(originalEncounterBody)

            const params = { id: originalEncounter._id }
            const updatedEncounterRequestBody = {
                title: originalEncounter.title,
                description: `NewRandomDescription_${Math.random()}`,
            }
            const ctx = fakeKoaContext(updatedEncounterRequestBody, params)

            await controller.updateEncounter(ctx, fakeKoaNext)

            expect(ctx.body.result._id).toStrictEqual(originalEncounter._id)
            expect(ctx.body.result.title).toBe(updatedEncounterRequestBody.title)
            expect(ctx.body.result.description).toBe(updatedEncounterRequestBody.description)
        })

        test('overwrites non-required fields when the incoming encounter does not include them', async () => {
            const controller = new EncounterController(model)

            const originalEncounterBody = {
                title: `RandomTitle_${Math.random()}`,
                description: `RandomDescription_${Math.random()}`,
                actions: [`RandomAction_${Math.random()}`],
            }
            const originalEncounter = await model.create(originalEncounterBody)

            const params = { id: originalEncounter._id }
            const updatedEncounterRequestBody = {
                title: originalEncounter.title,
                description: `NewRandomDescription_${Math.random()}`,
            }
            const ctx = fakeKoaContext(updatedEncounterRequestBody, params)

            await controller.updateEncounter(ctx, fakeKoaNext)

            expect(ctx.body.result._id).toStrictEqual(originalEncounter._id)
            expect(originalEncounter.actions.length).toBe(1)
            expect(ctx.body.result.actions.length).toBe(0)
        })

        test('actually updates encounter when there is a record with the given Mongo ObjectId', async () => {
            const controller = new EncounterController(model)

            const originalEncounterBody = {
                title: `RandomTitle_${Math.random()}`,
                description: `RandomDescription_${Math.random()}`,
                actions: [`RandomAction_${Math.random()}`],
            }
            const originalEncounter = await model.create(originalEncounterBody)

            const params = { id: originalEncounter._id }
            const updatedEncounterRequestBody = {
                title: originalEncounter.title,
                description: `NewRandomDescription_${Math.random()}`,
            }
            const ctx = fakeKoaContext(updatedEncounterRequestBody, params)

            await controller.updateEncounter(ctx, fakeKoaNext)
            const updatedEncounter = await model.findById(originalEncounter._id)

            expect(originalEncounter.title).toBe(updatedEncounter.title)
            expect(originalEncounter.description).toBe(originalEncounterBody.description)
            expect(originalEncounter.description !== updatedEncounter.description).toBe(true)
            expect(originalEncounter.actions.length).toBe(1)
            expect(updatedEncounter.actions.length).toBe(0)
        })

        test('actually creates new encounter when there is no record with the given Mongo ObjectId', async () => {
            const controller = new EncounterController(model)

            const params = { id: new mongoose.mongo.ObjectID() }
            const encounterRequestBody = {
                title: `RandomTitle_${Math.random()}`,
                description: `RandomDescription_${Math.random()}`,
                actions: [`RandomAction_${Math.random()}`],
            }
            const ctx = fakeKoaContext(encounterRequestBody, params)

            await controller.updateEncounter(ctx, fakeKoaNext)
            const encounter = await model.findById(ctx.body.result._id)

            expect(encounter._id).toStrictEqual(params.id)
            expect(encounter.title).toBe(encounterRequestBody.title)
            expect(encounter.description).toBe(encounterRequestBody.description)
            expect(encounter.actions.length).toBe(encounterRequestBody.actions.length)
            expect(encounter.actions).toContain(encounterRequestBody.actions[0])
        })

        test('returns a 201 when the encounter is successfully created', async () => {
            const controller = new EncounterController(model)

            const params = { id: new mongoose.mongo.ObjectID() }
            const encounterRequestBody = {
                title: `RandomTitle_${Math.random()}`,
                description: `RandomDescription_${Math.random()}`,
                actions: [`RandomAction_${Math.random()}`],
            }
            const ctx = fakeKoaContext(encounterRequestBody, params)

            await controller.updateEncounter(ctx, fakeKoaNext)

            expect(ctx.status).toBe(201)
        })

        test('returns the created encounter document when the encounter is successfully created', async () => {
            const controller = new EncounterController(model)

            const params = { id: new mongoose.mongo.ObjectID() }
            const encounterRequestBody = {
                title: `RandomTitle_${Math.random()}`,
                description: `RandomDescription_${Math.random()}`,
                actions: [`RandomAction_${Math.random()}`],
            }
            const ctx = fakeKoaContext(encounterRequestBody, params)

            await controller.updateEncounter(ctx, fakeKoaNext)

            expect(ctx.body.result._id).toStrictEqual(params.id)
            expect(ctx.body.result.title).toBe(encounterRequestBody.title)
            expect(ctx.body.result.description).toBe(encounterRequestBody.description)
            expect(ctx.body.result.actions.length).toBe(encounterRequestBody.actions.length)
            expect(ctx.body.result.actions).toContain(encounterRequestBody.actions[0])
        })

        test('returns a 404 when given an invalid Mongo ObjectId', async () => {
            const controller = new EncounterController(model)
            const params = { id: 'nonValidMongoObjectID' }
            const ctx = fakeKoaContext({}, params)

            try {
                await controller.updateEncounter(ctx, fakeKoaNext)
            } catch (error) {
                const msg = `ID must be a valid Mongo ObjectID. Received ${params.id}`
                expect(ctx.assert).toBeCalledWith(false, 404, msg)
                return
            }

            // Should not have reached this line
            expect(true).toBe(false)
        })

        test('returns a 400 when title does not exist on request body', async () => {
            const controller = new EncounterController(model)

            const newEncounterRequestBody = {
                description: 'Test Description',
            }
            const params = { id: new mongoose.mongo.ObjectID() }
            const ctx = fakeKoaContext(newEncounterRequestBody, params)

            try {
                await controller.updateEncounter(ctx, fakeKoaNext)
            } catch (error) {
                const msg = 'An encounter requires a title property of type string.'
                expect(ctx.assert).toBeCalledWith(false, 400, msg)
                return
            }

            // Should not have reached this line
            expect(true).toBe(false)
        })

        test('returns a 400 when title is not a string', async () => {
            const controller = new EncounterController(model)

            const newEncounterRequestBody = {
                title: 0,
                description: 'Test Description',
            }
            const params = { id: new mongoose.mongo.ObjectID() }
            const ctx = fakeKoaContext(newEncounterRequestBody, params)

            try {
                await controller.updateEncounter(ctx, fakeKoaNext)
            } catch (error) {
                const msg = 'An encounter requires a title property of type string.'
                expect(ctx.assert).toBeCalledWith(false, 400, msg)
                return
            }

            // Should not have reached this line
            expect(true).toBe(false)
        })

        test('returns a 400 when the title aleady exists on an encounter in the database', async () => {
            const controller = new EncounterController(model)

            const newEncounterRequestBody = {
                title: `RandomTitle_${Math.random()}`,
                description: `RandomDescription_${Math.random()}`,
            }
            const ctx = fakeKoaContext(newEncounterRequestBody)

            await model.create(newEncounterRequestBody)

            try {
                await controller.updateEncounter(ctx, fakeKoaNext)
            } catch (error) {
                const msg = `An encounter with the title ${newEncounterRequestBody.title} already exists.`
                expect(ctx.assert).toBeCalledWith(false, 400, msg)
                return
            }

            // Should not have reached this line
            expect(true).toBe(false)
        })

        test('returns a 400 when description does not exist on request body', async () => {
            const controller = new EncounterController(model)

            const newEncounterRequestBody = {
                title: 'Test Title',
            }
            const params = { id: new mongoose.mongo.ObjectID() }
            const ctx = fakeKoaContext(newEncounterRequestBody, params)

            try {
                await controller.updateEncounter(ctx, fakeKoaNext)
            } catch (error) {
                const msg = 'An encounter requires a description property of type string.'
                expect(ctx.assert).toBeCalledWith(false, 400, msg)
                return
            }

            // Should not have reached this line
            expect(true).toBe(false)
        })

        test('returns a 400 when description is not a string', async () => {
            const controller = new EncounterController(model)

            const newEncounterRequestBody = {
                title: 'Test Title',
                description: 0,
            }
            const params = { id: new mongoose.mongo.ObjectID() }
            const ctx = fakeKoaContext(newEncounterRequestBody, params)

            try {
                await controller.updateEncounter(ctx, fakeKoaNext)
            } catch (error) {
                const msg = 'An encounter requires a description property of type string.'
                expect(ctx.assert).toBeCalledWith(false, 400, msg)
                return
            }

            // Should not have reached this line
            expect(true).toBe(false)
        })

        test('returns a 400 when numberOfRuns is not a number', async () => {
            const controller = new EncounterController(model)

            const newEncounterRequestBody = {
                title: 'Test Title',
                description: 'Test Description',
                numberOfRuns: 'Not a number',
            }
            const params = { id: new mongoose.mongo.ObjectID() }
            const ctx = fakeKoaContext(newEncounterRequestBody, params)

            try {
                await controller.updateEncounter(ctx, fakeKoaNext)
            } catch (error) {
                const msg = "'numberOfRuns' property must be a number"
                expect(ctx.assert).toBeCalledWith(false, 400, msg)
                return
            }

            // Should not have reached this line
            expect(true).toBe(false)
        })

        test('returns a 400 when actions is not an array of strings', async () => {
            const controller = new EncounterController(model)

            const newEncounterRequestBody = {
                title: 'Test Title',
                description: 'Test Description',
                actions: [0, 1, 'Test Action'],
            }
            const params = { id: new mongoose.mongo.ObjectID() }
            const ctx = fakeKoaContext(newEncounterRequestBody, params)

            try {
                await controller.updateEncounter(ctx, fakeKoaNext)
            } catch (error) {
                const msg = "'actions' property must be an array of strings"
                expect(ctx.assert).toBeCalledWith(false, 400, msg)
                return
            }

            // Should not have reached this line
            expect(true).toBe(false)
        })
    })

    describe('patchEncounter', () => {
        test('returns a 200 when the encounter is successfully patched', async () => {
            const controller = new EncounterController()
            const originalEncounter = await model.create({ title: 'Test Title', description: 'Test Description' })

            const patchEncounterBody = {
                description: 'A Different Description',
            }
            const params = { id: originalEncounter._id }
            const ctx = fakeKoaContext(patchEncounterBody, params)

            await controller.patchEncounter(ctx, fakeKoaNext)

            expect(ctx.status).toBe(200)
        })

        test('replaces only the patched fields', async () => {
            const controller = new EncounterController()
            const originalEncounter = await model.create({ title: 'Test Title', description: 'Test Description' })

            const patchEncounterBody = {
                description: 'A Different Description',
            }
            const params = { id: originalEncounter._id }
            const ctx = fakeKoaContext(patchEncounterBody, params)

            await controller.patchEncounter(ctx, fakeKoaNext)
            const patchedEncounter = await model.findById(originalEncounter._id)

            expect(originalEncounter._id).toStrictEqual(patchedEncounter._id)
            expect(patchedEncounter.title).toBe(originalEncounter.title)
            expect(patchedEncounter.description).toBe(patchEncounterBody.description)
            expect(patchedEncounter.numberOfRuns).toBe(originalEncounter.numberOfRuns)
            expect(patchedEncounter.actions.length).toBe(originalEncounter.actions.length)
        })

        test('returns the patched encounter document when the encounter is successfully patched', async () => {
            const controller = new EncounterController()
            const originalEncounter = await model.create({ title: 'Test Title', description: 'Test Description' })

            const patchEncounterBody = {
                description: 'A Different Description',
            }
            const params = { id: originalEncounter._id }
            const ctx = fakeKoaContext(patchEncounterBody, params)

            await controller.patchEncounter(ctx, fakeKoaNext)

            expect(ctx.body.result._id).toStrictEqual(originalEncounter._id)
            expect(ctx.body.result.title).toBe(originalEncounter.title)
            expect(ctx.body.result.description).toBe(patchEncounterBody.description)
            expect(ctx.body.result.numberOfRuns).toBe(originalEncounter.numberOfRuns)
            expect(ctx.body.result.actions.length).toBe(originalEncounter.actions.length)
        })

        test('returns a 404 when given an invalid Mongo ObjectId', async () => {
            const controller = new EncounterController()
            const params = { id: 'nonValidMongoObjectID' }
            const ctx = fakeKoaContext({}, params)

            try {
                await controller.patchEncounter(ctx, fakeKoaNext)
            } catch (error) {
                const msg = `ID must be a valid Mongo ObjectID. Received ${params.id}`
                expect(ctx.assert).toBeCalledWith(false, 404, msg)
                return
            }

            // Should not have reached this line
            expect(true).toBe(false)
        })

        test('returns a 404 when there is no encounter document with the given Mongo ObjectId', async () => {
            const controller = new EncounterController()
            const params = { id: new mongoose.mongo.ObjectID() }
            const ctx = fakeKoaContext({}, params)

            try {
                await controller.patchEncounter(ctx, fakeKoaNext)
            } catch (error) {
                const msg = `No encounter found with ID ${params.id}`
                expect(ctx.assert).toBeCalledWith(false, 404, msg)
                return
            }

            // Should not have reached this line
            expect(true).toBe(false)
        })

        test('returns a 400 if the patched title is the same as one already in the database', async () => {
            const controller = new EncounterController()
            const firstEncounter = await model.create({ title: 'First Title', description: 'Test Description' })
            const secondEncounter = await model.create({ title: 'Other Title', description: 'Test Description' })

            const patchEncounterBody = {
                title: firstEncounter.title,
            }
            const params = { id: secondEncounter._id }
            const ctx = fakeKoaContext(patchEncounterBody, params)

            try {
                await controller.patchEncounter(ctx, fakeKoaNext)
            } catch (error) {
                const msg = `An encounter with the title ${patchEncounterBody.title} already exists.`
                expect(ctx.assert).toBeCalledWith(false, 400, msg)
                return
            }

            // Should not have reached this line
            expect(true).toBe(false)
        })
    })

    describe('deleteEncounter', () => {
        test('returns a 200 when the encounter is successfully deleted', async () => {
            const controller = new EncounterController(model)
            const encounter = await model.create({
                title: `RandomTitle_${Math.random()}`,
                description: `RandomDescription_${Math.random()}`,
            })

            const params = { id: encounter._id }
            const ctx = fakeKoaContext({}, params)

            await controller.deleteEncounter(ctx, fakeKoaNext)

            expect(ctx.status).toBe(200)
        })

        test('returns the deleted encounter document when it is successfully deleted', async () => {
            const controller = new EncounterController(model)
            const encounter = await model.create({
                title: `RandomTitle_${Math.random()}`,
                description: `RandomDescription_${Math.random()}`,
            })

            const params = { id: encounter._id }
            const ctx = fakeKoaContext({}, params)

            await controller.deleteEncounter(ctx, fakeKoaNext)

            expect(ctx.body.result._id).toStrictEqual(encounter._id)
            expect(ctx.body.result.title).toBe(encounter.title)
            expect(ctx.body.result.description).toBe(encounter.description)
            expect(ctx.body.result.actions.length).toBe(encounter.actions.length)
        })

        test('returns a 404 when the given ID is not a valid Mongo ObjectID', async () => {
            const controller = new EncounterController(model)
            const params = { id: 'nonValidMongObjectID' }
            const ctx = fakeKoaContext({}, params)

            try {
                await controller.inspectEncounter(ctx, fakeKoaNext)
            } catch (error) {
                const msg = `ID must be a valid Mongo ObjectID. Received ${params.id}`
                expect(ctx.assert).toBeCalledWith(false, 404, msg)
                return
            }

            // Should not have reached this line
            expect(true).toBe(false)
        })

        test('returns a 404 when the encounter with the given ID is not found', async () => {
            const controller = new EncounterController(model)
            const params = { id: new mongoose.mongo.ObjectID() }
            const ctx = fakeKoaContext({}, params)

            try {
                await controller.inspectEncounter(ctx, fakeKoaNext)
            } catch (error) {
                const msg = `No encounter found with ID ${params.id}`
                expect(ctx.assert).toBeCalledWith(false, 404, msg)
                return
            }

            // Should not have reached this line
            expect(true).toBe(false)
        })
    })
})
