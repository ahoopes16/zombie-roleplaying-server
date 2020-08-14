import { WeaponController } from '../../src/controllers/weapon.controller'
import WeaponModel, { WeaponCreationParams } from '../../src/models/weapon.model'
import { createFakeWeapon } from '../helpers/weapon.helper'
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
    await WeaponModel().deleteMany({})
})

afterAll(async () => {
    await mongoose.disconnect()
})

const model = WeaponModel()

describe('weapon controller', () => {
    describe('getWeapons', () => {
        test('returns empty array if there are no encounters', async () => {
            const controller = new WeaponController()

            const actual = await controller.getWeapons()

            expect(actual.result).toBeDefined()
            expect(actual.result.length).toBe(0)
        })

        test('returns array of encounters inside result', async () => {
            const controller = new WeaponController()
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

            const actual = await controller.getWeapons()

            expect(actual.result).toBeDefined()
            expect(actual.result.length).toBe(2)
            expect(actual.result.find(weapon => weapon.name === weaponOne.name)).toBeTruthy()
            expect(actual.result.find(weapon => weapon.name === weaponTwo.name)).toBeTruthy()
        })
    })

    describe('getWeapon', () => {
        test('returns desired encounter', async () => {
            const controller = new WeaponController()
            const weaponParams: WeaponCreationParams = {
                name: `Name_${Math.random()}`,
                description: `Description_${Math.random()}`,
                attackDieCount: 2,
                attackDieSides: 10,
            }

            const weapon = await createFakeWeapon(model, weaponParams)

            const actual = await controller.getWeapon(weapon._id)

            expect(actual.result).toBeDefined()
            expect(actual.result.name).toBe(weapon.name)
            expect(actual.result.description).toBe(weapon.description)
        })
    })

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

    describe('deleteWeapon', () => {
        test.skip('returns deleted weapon inside result', async () => {
            const controller = new WeaponController()
            const weaponParams: WeaponCreationParams = {
                name: `Weapon_${Math.random()}`,
                description: `Description_${Math.random()}`,
                attackDieCount: 2,
                attackDieSides: 10,
            }
            const expected = await createFakeWeapon(model, weaponParams)

            const actual = await controller.deleteWeapon(expected._id)

            expect(actual.result).toBeDefined()
            expect(actual.result.name).toBe(expected.name)
            expect(actual.result.description).toBe(expected.description)
            expect(actual.result._id.toString()).toBe(expected._id.toString())
        })
    })
})
