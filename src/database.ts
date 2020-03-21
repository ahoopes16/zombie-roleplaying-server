import * as mongoose from 'mongoose'
import { Mongoose } from 'mongoose'
import logger from '../util/logger.util'
import env from '../environment'

export default class DBConnector {
    private host: string
    private port: number
    private db: string

    /**
     * A connector to hook Mongoose into a given MongoDB instance.
     * Current implementation does not support replica sets or SSL connections.
     * @param host The hostname of the MongoDB instance. Defaults to environment variable
     * @param port The port number for the MongoDB instance. Defaults to environment variable
     * @param db The database name that you want to connect to. Defaults to environment variable
     */
    constructor(host = env.mongo.host, port = env.mongo.port, db = env.mongo.db) {
        this.host = host
        this.port = port
        this.db = db
    }

    /**
     * Set the hostname of the MongoDB instance you would like to connect to
     * @param host The hostname of the MongoDB instance
     */
    public setHost(host: string): void {
        this.host = host
    }

    /**
     * Set the port number that will be applied to the Mongo URL
     * @param port Port number
     */
    public setPort(port: number): void {
        this.port = port
    }

    /**
     * Set the database name that will be applied to the Mongo URL
     * @param db Database name
     */
    public setDB(db: string): void {
        this.db = db
    }

    /** Builds a properly formatted Mongo URL. Current implementation does not support replica sets */
    public buildMongoURL(): string {
        return `mongodb://${this.host}:${this.port}/${this.db}`
    }

    /** Builds the Mongoose connection options */
    public buildMongoOptions(): mongoose.ConnectionOptions {
        const options: mongoose.ConnectionOptions = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }

        return options
    }

    /**
     * Create a connection to the MongoDB using Mongoose
     * @param url The connection URL for the MongoDB instance. Defaults to building based on whatever is in the connector
     * @param options The Mongoose options to use for creating the connection. Defaults to building based on whatever is in the connector
     */
    public connect(url = this.buildMongoURL(), options = this.buildMongoOptions()): Promise<Mongoose> {
        logger.info(`Connecting to MongoDB at ${url}...`)

        const dbConnection = mongoose.connection
        dbConnection.on('error', error => {
            logger.error(`Failed to connect to MongoDB at ${url}. Error: ${error}`)
            process.exit(1)
        })
        dbConnection.once('open', () => logger.info(`Successfully connected to MongoDB at ${url}!`))

        return mongoose.connect(url, options)
    }
}
