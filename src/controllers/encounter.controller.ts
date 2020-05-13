import { Body, Controller, Post, Path, Response, Route, SuccessResponse, Get } from 'tsoa'
import { Encounter, EncounterCreationParams } from '../models/encounter.model'
import { EncounterService } from '../services/encounter.service'
import { ErrorResponseJSON } from '../middleware/error-handler.middleware'
import { SuccessResponseJSON } from '../types/Response.type'

@Route('encounters')
export class EncounterController extends Controller {
    private service: EncounterService

    constructor(service = new EncounterService()) {
        super()
        this.service = service
    }

    /**
     * Get a list of all encounters.
     * Currently there is no pagination or limits implemented.
     */
    @Response<ErrorResponseJSON>(500, 'Internal Server Error')
    @SuccessResponse(200, 'Success')
    @Get()
    public async getEncounters(): Promise<SuccessResponseJSON<Encounter[]>> {
        this.setStatus(200)
        return { result: await this.service.listEncounters() }
    }

    /**
     * Get a specific encounter by Mongo ID.
     * @param id Mongo ObjectID of the desired encounter
     */
    @Response<ErrorResponseJSON>(404, 'Encounter Not Found')
    @Response<ErrorResponseJSON>(400, 'Validation Failed')
    @Response<ErrorResponseJSON>(500, 'Internal Server Error')
    @SuccessResponse(200, 'Success')
    @Get('{id}')
    public async getEncounter(@Path() id: string): Promise<SuccessResponseJSON<Encounter>> {
        this.setStatus(200)
        return { result: await this.service.inspectEncounter(id) }
    }

    /**
     * Creates an encounter.
     * Supply the title, description, and actions optionally.
     * The title must be unique, or else you will receive an error.
     * @param requestBody A JSON body containing the title, description, and optionally a list of actions.
     */
    @Response<ErrorResponseJSON>(400, 'Validation Failed')
    @SuccessResponse(201, 'Successfully Created')
    @Post()
    public async postEncounter(@Body() requestBody: EncounterCreationParams): Promise<SuccessResponseJSON<Encounter>> {
        this.setStatus(201)
        return { result: await this.service.createEncounter(requestBody) }
    }
}
