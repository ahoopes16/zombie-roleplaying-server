import * as Router from 'koa-router'
const router = new Router({ prefix: '/v1/encounters' })

router.get('/', async () => console.log('GET ENCOUNTERS'))
router.put('/', async () => console.log('PUT ENCOUNTERS'))
router.patch('/', async () => console.log('PATCH ENCOUNTERS'))
router.post('/', async () => console.log('POST ENCOUNTERS'))
router.delete('/', async () => console.log('DELETE ENCOUNTERS'))

export default router
