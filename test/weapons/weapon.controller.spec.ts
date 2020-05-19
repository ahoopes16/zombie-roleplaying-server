import { WeaponController } from '../../src/controllers/weapon.controller'
import EncounterModel, { WeaponCreationParams } from '../../src/models/weapon.model'
import DBConnector from '../../src/database'
import env from '../../src/environment'
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

describe('weapon controller', () => {
    describe('postWeapon', () => {
        test('returns created weapon inside result', async () => {
            const expected: WeaponCreationParams = {
                name: `Weapon_${Math.random()}`,
                description: `Description_${Math.random()}`,
                attackDieCount: 2,
                attackDieSides: 10,
            }
            const controller = new WeaponController()

            const actual = await controller.postWeapon(expected)

            expect(actual.result).toBeDefined()
            expect(actual.result.name).toBe(expected.name)
            expect(actual.result.description).toBe(expected.description)
            expect(actual.result.attackDieCount).toBe(expected.attackDieCount)
            expect(actual.result.attackDieSides).toBe(expected.attackDieSides)
        })
    })
})
