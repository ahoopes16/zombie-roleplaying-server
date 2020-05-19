import { WeaponService } from '../src/services/weapon.service'
import WeaponModel, { WeaponCreationParams } from '../src/models/weapon.model'
import { createFakeWeapon } from './helpers/weapon.helper'
import DBConnector from '../src/database'
import env from '../src/environment'
import * as mongoose from 'mongoose'
import * as Boom from '@hapi/boom'

beforeAll(async () => {
    const url = new DBConnector().setDB(env.mongo.testDb).buildMongoURL()
    mongoose.set('useCreateIndex', true)
    mongoose.set('useFindAndModify', false)
    await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
})

beforeEach(async () => {
    await WeaponModel().deleteMany({})
})

afterAll(async () => {
    await mongoose.disconnect()
})

const model = WeaponModel()

const nameExistsError = (name: string): Boom.Boom => {
    return Boom.badRequest(`A weapon with the name "${name}" already exists.`)
}

describe('weapon service', () => {
    describe('createWeapon', () => {
        test('happy path - returns created weapon', async () => {
            const service = new WeaponService()
            const expected: WeaponCreationParams = {
                name: `Weapon_${Math.random()}`,
                description: `Description_${Math.random()}`,
                attackDieCount: 2,
                attackDieSides: 8,
            }

            const actual = await service.createWeapon(expected)

            expect(actual.name).toBe(expected.name)
            expect(actual.description).toBe(expected.description)
            expect(actual.attackDieCount).toBe(expected.attackDieCount)
            expect(actual.attackDieSides).toBe(expected.attackDieSides)
        })

        test('throws a BadRequest error when given a name that already exists', async () => {
            const weaponParams: WeaponCreationParams = {
                name: `Weapon_${Math.random()}`,
                description: `Description_${Math.random()}`,
                attackDieCount: 2,
                attackDieSides: 8,
            }
            await createFakeWeapon(model, weaponParams)
            const createParams: WeaponCreationParams = {
                name: weaponParams.name,
                description: `Desc_${Math.random()}`,
                attackDieCount: 3,
                attackDieSides: 10,
            }
            const expectedError = nameExistsError(weaponParams.name)

            const service = new WeaponService()

            await expect(service.createWeapon(createParams)).rejects.toThrow(expectedError)
        })
    })
})
