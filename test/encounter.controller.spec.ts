import { EncounterController } from '../src/controllers/encounter.controller'
import EncounterModel from '../src/models/encounter.model'
import DBConnector from '../src/database'
import env from '../src/environment'
import * as mongoose from 'mongoose'
import { fakeKoaContext, fakeKoaNext } from './helpers/koa.helper'

beforeAll(async () => {
    const url = new DBConnector().setDB(env.mongo.testDb).buildMongoURL()
    await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
})

beforeEach(async () => {
    await EncounterModel().deleteMany({})
})

afterAll(async () => {
    await mongoose.disconnect()
})

describe('encounter controller', () => {
    describe('getEncounters', () => {
        test('returns an empty array as the result when no encounters exist', async () => {
            const model = EncounterModel()
            const controller = new EncounterController(model)
            const ctx = fakeKoaContext()

            await controller.getEncounters(ctx, fakeKoaNext)

            expect(ctx.body.result).toBeTruthy()
            expect(ctx.body.result.length).toBe(0)
        })

        test('returns array of encounters when they exist', async () => {
            const model = EncounterModel()
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
            const model = EncounterModel()
            const controller = new EncounterController(model)

            const newEncounterRequestBody = {
                title: `RandomTitle_${Math.random()}`,
                description: `RandomDescription_${Math.random()}`,
                actions: [`RandomAction_${Math.random()}`],
            }
            const ctx = fakeKoaContext(newEncounterRequestBody)

            await controller.createEncounter(ctx, fakeKoaNext)
            expect(ctx.body.result).toBeTruthy()

            const actual = await model.findById(ctx.body.result._id)
            expect(actual.title).toBe(newEncounterRequestBody.title)
            expect(actual.description).toBe(newEncounterRequestBody.description)
            expect(actual.actions.length).toBe(newEncounterRequestBody.actions.length)
        })

        test('returns a 400 if title does not exist on request body', async () => {
            const model = EncounterModel()
            const controller = new EncounterController(model)

            const newEncounterRequestBody = {
                description: 'Test Description',
            }
            const ctx = fakeKoaContext(newEncounterRequestBody)

            try {
                await controller.createEncounter(ctx, fakeKoaNext)
            } catch (error) {
                expect(ctx.assert).toBeCalledWith(false, 400, 'An encounter requires a title property of type string.')
                return
            }

            // Should not have reached this line
            expect(true).toBe(false)
        })

        test('returns a 400 if title is not a string', async () => {
            const model = EncounterModel()
            const controller = new EncounterController(model)

            const newEncounterRequestBody = {
                title: 0,
                description: 'Test Description',
            }
            const ctx = fakeKoaContext(newEncounterRequestBody)

            try {
                await controller.createEncounter(ctx, fakeKoaNext)
            } catch (error) {
                expect(ctx.assert).toBeCalledWith(false, 400, 'An encounter requires a title property of type string.')
                return
            }

            // Should not have reached this line
            expect(true).toBe(false)
        })

        test('returns a 400 if description does not exist on request body', async () => {
            const model = EncounterModel()
            const controller = new EncounterController(model)

            const newEncounterRequestBody = {
                title: 'Test Title',
            }
            const ctx = fakeKoaContext(newEncounterRequestBody)

            try {
                await controller.createEncounter(ctx, fakeKoaNext)
            } catch (error) {
                expect(ctx.assert).toBeCalledWith(
                    false,
                    400,
                    'An encounter requires a description property of type string.',
                )
                return
            }

            // Should not have reached this line
            expect(true).toBe(false)
        })

        test('returns a 400 if description is not a string', async () => {
            const model = EncounterModel()
            const controller = new EncounterController(model)

            const newEncounterRequestBody = {
                title: 'Test Title',
                description: 0,
            }
            const ctx = fakeKoaContext(newEncounterRequestBody)

            try {
                await controller.createEncounter(ctx, fakeKoaNext)
            } catch (error) {
                expect(ctx.assert).toBeCalledWith(
                    false,
                    400,
                    'An encounter requires a description property of type string.',
                )
                return
            }

            // Should not have reached this line
            expect(true).toBe(false)
        })

        test('returns a 400 if the title already exists in the database', async () => {
            const model = EncounterModel()
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
                expect(ctx.assert).toBeCalledWith(
                    false,
                    400,
                    `An encounter with the title ${newEncounterRequestBody.title} already exists.`,
                )
                return
            }

            // Should not have reached this line
            expect(true).toBe(false)
        })
    })
})
