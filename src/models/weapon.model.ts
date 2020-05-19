import { Schema, Document, model, Model } from 'mongoose'

/**
 * Weapons are items that a player can use to help fend off the zombies.
 * Attack power is defined as the number of die and the number of sides the die should have.
 * Their titles must be unique.
 */
export interface Weapon {
    /**
     * The name of the weapon.
     * @example "Baseball Bat"
     */
    name: string

    /**
     * Some text describing the weapon.
     * @example "An old wooden bat that probably belonged to some kid."
     */
    description: string

    /**
     * The number of die to use when attacking with this weapon.
     * @example 2
     */
    attackDieCount: number

    /**
     * The number of sides the die should have when attacking with this weapon.
     * @example 10
     */
    attackDieSides: number

    /**
     * The number of times this weapon has been looted by players.
     * @example 2
     */
    timesLooted: number

    /**
     * The date this document was created. Created by Mongoose.
     * @example "2020-01-01T00:00:00.000Z"
     */
    createdAt: Date

    /**
     * The last date this document was updated. Created by Mongoose.
     * @example "2020-01-01T00:00:00.000Z"
     */
    updatedAt: Date

    /**
     * The version number for this document. Created by Mongoose.
     * @example 1
     */
    __v: number
}

const weaponSchema = new Schema(
    {
        name: { type: String, required: true, unique: true, trim: true },
        description: { type: String, required: true },
        attackDieCount: { type: Number, required: true },
        attackDieSides: { type: Number, required: true },
        timesLooted: { type: Number, required: true },
    },
    { timestamps: true },
)

export default (): Model<Weapon & Document> => model<Weapon & Document>('Weapon', weaponSchema)
