import { Body, Controller, Post, Response, Route, SuccessResponse } from 'tsoa'
import { Encounter } from '../models/encounter.model'
import { EncounterService, EncounterCreationParams } from '../services/encounter.service'
import { ValidateErrorJSON } from '../middleware/error-handler.middleware'
import { JSONResponse } from '../types/JSONResponse.type'

@Route('encounters')
export class EncounterController extends Controller {
    private service: EncounterService

    constructor(service = new EncounterService()) {
        super()
        this.service = service
    }

    /**
     * Creates an encounter.
     * Supply the title, description, and actions optionally.
     * The title must be unique, or else you will receive an error.
     * @param requestBody A JSON body containing the title, description, and optionally a list of actions.
     */
    @Response<ValidateErrorJSON>(400, 'Validation Failed')
    @SuccessResponse(201, 'Successfully Created')
    @Post()
    public async createEncounter(@Body() requestBody: EncounterCreationParams): Promise<JSONResponse<Encounter>> {
        this.setStatus(201)
        const result = await this.service.createEncounter(requestBody)
        return { result }
    }
}
