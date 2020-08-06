import { WeaponService } from '../../src/services/weapon.service'
import WeaponModel, { WeaponCreationParams } from '../../src/models/weapon.model'
import { createFakeWeapon } from '../helpers/weapon.helper'
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
    await WeaponModel().deleteMany({})
})

afterAll(async () => {
    await mongoose.disconnect()
})

const model = WeaponModel()

const nameExistsError = (name: string): Boom.Boom => {
    return Boom.badRequest(`A weapon with the name "${name}" already exists.`)
}

const invalidMongoIDError = (id: string): Boom.Boom => {
    return Boom.badRequest(`Invalid Mongo ObjectID. Please give a valid Mongo ObjectID. Received "${id}".`)
}

const notFoundError = (id: string): Boom.Boom => {
    return Boom.notFound(`Item with ID "${id}" not found.`)
}

describe('weapon service', () => {
    describe('listWeapons', () => {
        test('happy path - returns list of weapons', async () => {
            const service = new WeaponService()
            const weaponOneParams: WeaponCreationParams = {
                name: `Name_${Math.random()}`,
                description: `Description_${Math.random()}`,
                attackDieCount: 2,
                attackDieSides: 10,
            }
            const weaponTwoParams: WeaponCreationParams = {
                name: `Name_${Math.random()}`,
                description: `Description_${Math.random()}`,
                attackDieCount: 3,
                attackDieSides: 12,
            }
            const weaponOne = await createFakeWeapon(model, weaponOneParams)
            const weaponTwo = await createFakeWeapon(model, weaponTwoParams)

            const actual = await service.listWeapons()

            expect(actual).toBeDefined()
            expect(actual.length).toBe(2)
            expect(actual.find(weapon => weapon.name === weaponOne.name)).toBeTruthy()
            expect(actual.find(weapon => weapon.name === weaponTwo.name)).toBeTruthy()
        })
    })

    describe('inspectWeapon', () => {
        test('happy path - return weapon', async () => {
            const service = new WeaponService()
            const weaponParams: WeaponCreationParams = {
                name: `Name_${Math.random()}`,
                description: `Description_${Math.random()}`,
                attackDieCount: 2,
                attackDieSides: 10,
            }

            const expected = await createFakeWeapon(model, weaponParams)
            const actual = await service.inspectWeapon(expected._id)

            expect(actual).toBeTruthy()
            expect(actual._id.toString()).toBe(expected._id.toString())
            expect(actual.name).toBe(expected.name)
            expect(actual.description).toBe(expected.description)
        })

        test('throws a BadRequest error when given an invalid Mongo ID', async () => {
            const service = new WeaponService()
            const invalidId = `invalid-id-${Math.random()}`
            const expectedError = invalidMongoIDError(invalidId)

            await expect(service.inspectWeapon(invalidId)).rejects.toThrow(expectedError)
        })

        test('throws a NotFound error when given a valid Mongo ID that does not exist', async () => {
            const mongoId = new ObjectId().toString()
            const expectedError = notFoundError(mongoId)

            const service = new WeaponService()

            await expect(service.inspectWeapon(mongoId)).rejects.toThrow(expectedError)
        })
    })

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
