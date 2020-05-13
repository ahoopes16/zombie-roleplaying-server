import { Body, Controller, Post, Response, Route, SuccessResponse, Get } from 'tsoa'
import { Encounter, EncounterCreationParams } from '../models/encounter.model'
import { EncounterService } from '../services/encounter.service'
import { ErrorResponseJSON } from '../middleware/error-handler.middleware'
import { JSONResponse } from '../types/JSONResponse.type'

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
    public async getEncounters(): Promise<JSONResponse<Encounter[]>> {
        this.setStatus(200)
        return { result: await this.service.listEncounters() }
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
    public async postEncounter(@Body() requestBody: EncounterCreationParams): Promise<JSONResponse<Encounter>> {
        this.setStatus(201)
        return { result: await this.service.createEncounter(requestBody) }
    }
}
