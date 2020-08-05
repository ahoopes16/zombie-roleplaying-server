import { Body, Controller, Get, Path, Post, Response, Route, SuccessResponse } from 'tsoa'
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
     * Get a list of all weapons.
     * Currently there is no pagination or limits implemented.
     */
    @SuccessResponse(200, 'Success')
    @Response<ErrorResponseJSON>(500, 'Internal Server Error')
    @Get()
    public async getWeapons(): Promise<SuccessResponseJSON<Weapon[]>> {
        this.setStatus(200)
        return { result: await this.service.listWeapons() }
    }

    /**
     * Get the details of a specific weapon by Mongo ID.
     * @param id Mongo ObjectID of the desired weapon
     */
    @SuccessResponse(200, 'Success')
    @Response<ErrorResponseJSON>(400, 'Validation Failed')
    @Response<ErrorResponseJSON>(404, 'Weapon Not Found')
    @Response<ErrorResponseJSON>(500, 'Internal Server Error')
    @Get('{id}')
    public async getWeapon(@Path() id: string): Promise<SuccessResponseJSON<Weapon>> {
        this.setStatus(200)
        return { result: await this.service.inspectWeapon(id) }
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
