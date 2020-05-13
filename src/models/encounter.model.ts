import { Schema, Document, model, Model } from 'mongoose'

/**
 * Encounters are events that can happen to you as a player.
 * Their titles must be unique, and a list of actions the player
 * can take may be defined.
 */
export interface Encounter {
    /**
     * A fun title for the encounter.
     * @example "A Zombie Grabs Your Leg!"
     */
    title: string

    /**
     * Some text describing what happens in this encounter.
     * @example "You can tell from here that it has terrible breath."
     */
    description: string

    /**
     * A list of actions the user can take when they hit this encounter.
     * @example ["Attempt to kick it away!"]
     */
    actions?: string[]

    /**
     * How many times this encounter has been run.
     * Defaults to 0.
     * @example 0
     */
    numberOfRuns: number

    /** The date this document was created. Created by Mongoose. */
    createdAt: Date

    /** The last date this document was updated. Created by Mongoose. */
    updatedAt: Date

    /** The version number for this document. Created by Mongoose. */
    __v: number
}

export type EncounterCreationParams = Pick<Encounter, 'title' | 'description' | 'actions'>
export type EncounterPatchParams = Partial<EncounterCreationParams>

const encounterSchema = new Schema(
    {
        title: { type: String, required: true, unique: true, trim: true },
        description: { type: String, required: true },
        actions: [String],
        numberOfRuns: { type: Number, default: 0 },
    },
    { timestamps: true },
)

export default (): Model<Encounter & Document> => model<Encounter & Document>('Encounter', encounterSchema)
