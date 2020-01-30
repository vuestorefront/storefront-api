import { StorefrontApiModule } from '@storefront-api/lib/module'
import { StorefrontApiContext } from '@storefront-api/lib/module/types'
import img from './api/img'
import CacheFactory from './image/cache/factory';
import LocalImageAction from './image/action/local';
import FileImageCache from './image/cache/file';
import ActionFactory from './image/action/factory';
import { Cache } from './image/cache/abstract';
import { Action } from './image/action/abstract';
import Logger from '@storefront-api/lib/logger'

export const module: StorefrontApiModule = new StorefrontApiModule({
  key: 'default-img',
  initApi: ({ config, db, app }: StorefrontApiContext): void => {
    app.use('/img', img({ config, db }));
    app.use('/img/:width/:height/:action/:image', (req, res, next) => {
      Logger.info(req.params)
    });
  }
})

interface imageActions {
  name: string,
  class: Action
}

interface cacheActions {
  name: string,
  class: Cache
}

export const DefaultImgModule = ({ imageActions, cacheActions }: { imageActions?: imageActions[], cacheActions?: cacheActions[] } = {}): StorefrontApiModule => {
  ActionFactory.addAdapter('local', LocalImageAction)
  CacheFactory.addAdapter('file', FileImageCache)
  if (Array.isArray(imageActions)) {
    imageActions.forEach((action) => {
      ActionFactory.addAdapter(action.name, action.class)
    })
  }

  if (Array.isArray(imageActions)) {
    cacheActions.forEach((cache) => {
      CacheFactory.addAdapter(cache.name, cache.class)
    })
  }

  return module
}
