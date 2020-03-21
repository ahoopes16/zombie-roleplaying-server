import * as Router from 'koa-router'
import { EncounterController } from '../controllers/encounter.controller'
const encounterController = new EncounterController()

const router = new Router({ prefix: '/v1/encounters' })

router.get('/', encounterController.getEncounters)
router.post('/', encounterController.createEncounter)
router.get('/:id', encounterController.inspectEncounter)
router.put('/:id', async () => console.log('PUT ENCOUNTER'))
router.patch('/:id', async () => console.log('PATCH ENCOUNTER'))
router.delete('/:id', async () => console.log('DELETE ENCOUNTER'))

export default router
