import * as Router from 'koa-router'
import { EncounterController } from '../controllers/encounter.controller'
const encounterController = new EncounterController()

const router = new Router({ prefix: '/v1/encounters' })

router.get('/', encounterController.getEncounters)
router.put('/', async () => console.log('PUT ENCOUNTERS'))
router.patch('/', async () => console.log('PATCH ENCOUNTERS'))
router.post('/', encounterController.createEncounter)
router.delete('/', async () => console.log('DELETE ENCOUNTERS'))

export default router
