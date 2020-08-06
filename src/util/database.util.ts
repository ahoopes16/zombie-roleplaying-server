import { Model, Document, isValidObjectId } from 'mongoose'
import * as Boom from '@hapi/boom'

export const validateMongoID = (id: string): void => {
    if (!isValidObjectId(id)) {
        throw Boom.badRequest(`Invalid Mongo ObjectID. Please give a valid Mongo ObjectID. Received "${id}".`)
    }
}

export async function validateIdExistsInModel<T>(id: string, model: Model<T & Document>): Promise<T & Document> {
    const item = await model.findById(id).exec()
    if (!item) {
        throw Boom.notFound(`Item with ID "${id}" not found.`)
    }

    return item
}
