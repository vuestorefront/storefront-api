import { Router } from 'express';
import createMapRoute from './map';

export default ({ config, db }) => {
  const router = Router()

  router.use('/map', createMapRoute({ config }))

  return router
}
