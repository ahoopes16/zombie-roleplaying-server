import WeaponModel, { Weapon, WeaponCreationParams } from '../models/weapon.model'
import { Model, Document } from 'mongoose'
import { validateMongoID, validateIdExistsInModel } from '../util/database.util'
import * as Boom from '@hapi/boom'

export class WeaponService {
    private model: Model<Weapon & Document>

    constructor(model = WeaponModel()) {
        this.model = model
    }

    public listWeapons(): Promise<Array<Weapon & Document>> {
        return this.model.find().exec()
    }

    public async inspectWeapon(id: string): Promise<Weapon & Document> {
        validateMongoID(id)
        const weapon = await validateIdExistsInModel(id, this.model)
        return weapon
    }

    public async createWeapon(weaponParams: WeaponCreationParams): Promise<Weapon & Document> {
        await this.validateNameDoesNotExist(weaponParams)
        return this.model.create(weaponParams)
    }

    public async replaceOrCreateWeapon(_id: string, newWeapon: Weapon): Promise<Weapon & Document> {
        validateMongoID(_id)
        await this.validateNameDoesNotExist(newWeapon, _id)

        return this.model.findOneAndUpdate({ _id }, newWeapon, {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
        })
    }

    public async removeWeapon(id: string): Promise<Weapon & Document> {
        validateMongoID(id)
        await validateIdExistsInModel(id, this.model)
        return this.model.findByIdAndRemove(id)
    }

    private async validateNameDoesNotExist(params: WeaponCreationParams | Weapon, excludeId = ''): Promise<void> {
        const { name } = params

        if (!name) {
            return
        }

        const query = excludeId ? { name, _id: { $ne: excludeId } } : { name }
        const weaponAlreadyExists = Boolean(await this.model.findOne(query).exec())
        if (weaponAlreadyExists) {
            throw Boom.badRequest(`A weapon with the name "${name}" already exists.`)
        }
    }
}
