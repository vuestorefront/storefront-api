import { Router } from 'express'
import { ExtensionAPIFunctionParameter } from '@storefront-api/lib/module'
import createMapRoute from './map'

export default ({ config, db }: ExtensionAPIFunctionParameter): Router => {
  const router = Router()

  router.use('/map', createMapRoute({ config, db }))

  return router
}
