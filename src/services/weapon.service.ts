import WeaponModel, { Weapon, WeaponCreationParams } from '../models/weapon.model'
import { Model, Document } from 'mongoose'
import * as Boom from '@hapi/boom'

export class WeaponService {
    private model: Model<Weapon & Document>

    constructor(model = WeaponModel()) {
        this.model = model
    }

    public async createWeapon(weaponParams: WeaponCreationParams): Promise<Weapon & Document> {
        await this.validateNameDoesNotExist(weaponParams)
        return this.model.create(weaponParams)
    }

    private async validateNameDoesNotExist(params: WeaponCreationParams | Weapon): Promise<void> {
        const { name } = params

        if (!name) {
            return
        }

        const weaponAlreadyExists = Boolean(await this.model.findOne({ name }).exec())
        if (weaponAlreadyExists) {
            throw Boom.badRequest(`A weapon with the name "${name}" already exists.`)
        }
    }
}
