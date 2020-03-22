import { Schema, Document, model, Model } from 'mongoose'

export interface Encounter extends Document {
    /** A fun title for the encounter */
    title: string
    /** Some text describing what happens in this encounter */
    description: string
    /** A list of actions the user must take when they hit this encounter */
    actions: string[]
    /** How many times this encounter has been run. Defaults to 0 */
    numberOfRuns: number
    /** The date this document was created. Created by Mongoose */
    createdAt: Date
    /** The last date this document was updated. Created by Mongoose */
    updatedAt: Date
    /** The version number for this document. Created by Mongoose */
    __v: number
}

const encounterSchema = new Schema(
    {
        title: { type: String, required: true, unique: true, trim: true },
        description: { type: String, required: true },
        actions: [String],
        numberOfRuns: { type: Number, default: 0 },
    },
    { timestamps: true },
)

export default (): Model<Encounter> => model<Encounter>('Encounter', encounterSchema)
