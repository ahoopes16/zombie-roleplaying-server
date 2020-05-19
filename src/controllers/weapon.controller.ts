import { Body, Controller, Post, Response, Route, SuccessResponse } from 'tsoa'
import { Weapon, WeaponCreationParams } from '../models/weapon.model'
import { WeaponService } from '../services/weapon.service'
import { SuccessResponseJSON, ErrorResponseJSON } from '../types/Response.type'

@Route('weapons')
export class WeaponController extends Controller {
    private service: WeaponService

    constructor(service = new WeaponService()) {
        super()
        this.service = service
    }

    /**
     * Creates a weapon.
     * Supply the name, description, and attack die count/sides.
     * The name must be unique, or else you will receive an error.
     * Returns the created weapon.
     * @param requestBody A JSON body containing the weapon's name, description, and attack die count/sides.
     */
    @SuccessResponse(201, 'Successfully Created')
    @Response<ErrorResponseJSON>(400, 'Validation Failed')
    @Response<ErrorResponseJSON>(500, 'Internal Server Error')
    @Post()
    public async postWeapon(@Body() requestBody: WeaponCreationParams): Promise<SuccessResponseJSON<Weapon>> {
        this.setStatus(201)
        return { result: await this.service.createWeapon(requestBody) }
    }
}
