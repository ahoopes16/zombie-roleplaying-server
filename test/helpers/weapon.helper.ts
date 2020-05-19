import { Model, Document } from 'mongoose'
import WeaponModel, { Weapon, WeaponCreationParams } from '../../src/models/weapon.model'

const defaultWeaponParams: WeaponCreationParams = {
    name: `Weapon_${Math.random()}`,
    description: `Desc_${Math.random()}`,
    attackDieCount: 2,
    attackDieSides: 8,
}

export const createFakeWeapon = (
    model: Model<Weapon & Document> = WeaponModel(),
    weaponParams: WeaponCreationParams = defaultWeaponParams,
): Promise<Weapon & Document> => {
    return model.create(weaponParams)
}
