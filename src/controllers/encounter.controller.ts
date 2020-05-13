import { Body, Controller, Post, Patch, Path, Response, Route, SuccessResponse, Get } from 'tsoa'
import { Encounter, EncounterCreationParams, EncounterPatchParams } from '../models/encounter.model'
import { EncounterService } from '../services/encounter.service'
import { SuccessResponseJSON, ErrorResponseJSON } from '../types/Response.type'

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
    @SuccessResponse(200, 'Success')
    @Response<ErrorResponseJSON>(500, 'Internal Server Error')
    @Get()
    public async getEncounters(): Promise<SuccessResponseJSON<Encounter[]>> {
        this.setStatus(200)
        return { result: await this.service.listEncounters() }
    }

    /**
     * Get a specific encounter by Mongo ID.
     * @param id Mongo ObjectID of the desired encounter
     */
    @SuccessResponse(200, 'Success')
    @Response<ErrorResponseJSON>(400, 'Validation Failed')
    @Response<ErrorResponseJSON>(404, 'Encounter Not Found')
    @Response<ErrorResponseJSON>(500, 'Internal Server Error')
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
    @SuccessResponse(201, 'Successfully Created')
    @Response<ErrorResponseJSON>(400, 'Validation Failed')
    @Post()
    public async postEncounter(@Body() requestBody: EncounterCreationParams): Promise<SuccessResponseJSON<Encounter>> {
        this.setStatus(201)
        return { result: await this.service.createEncounter(requestBody) }
    }

    /**
     * Partially updates an encounter.
     * Provide only the fields you want to update,
     * the rest will remain the same.
     * @param id Mongo ObjectID of the desired encounter
     * @param requestBody Fields and values to update on the encounter
     */
    @SuccessResponse(200, 'Successfully Updated')
    @Response<ErrorResponseJSON>(400, 'Validation Failed')
    @Response<ErrorResponseJSON>(404, 'Encounter Not Found')
    @Patch('{id}')
    public async patchEncounter(
        @Path() id: string,
        @Body() requestBody: EncounterPatchParams,
    ): Promise<SuccessResponseJSON<Encounter>> {
        this.setStatus(200)
        return { result: await this.service.partiallyUpdateEncounter(id, requestBody) }
    }
}
