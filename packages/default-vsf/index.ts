import { StorefrontApiModule, registerExtensions } from '@storefront-api/lib/module/index'
import { StorefrontApiContext } from '@storefront-api/lib/module/types'
import { Router } from 'express';
import order from './api/order';
import user from './api/user';
import stock from './api/stock';
import review from './api/review';
import cart from './api/cart';
import product from './api/product';
import sync from './api/sync';
import middleware from './middleware'
import url from './api/url'
import { version } from './package.json';
import path from 'path'
import PlatformFactory, { Platform } from '@storefront-api/platform/factory';

interface DefaultVuestorefrontApiOptions {
  platform: Platform
}

export const DefaultVuestorefrontApiModule = (options: DefaultVuestorefrontApiOptions): StorefrontApiModule => {
  PlatformFactory.addPlatform(options.platform)

  return new StorefrontApiModule({
    key: 'default-vsf',
    initMiddleware: ({ config, db, app }: StorefrontApiContext): void => {
      app.use(middleware({ config, db }));
    },
    initApi: ({ config, db, app }: StorefrontApiContext): void => {
      let api = Router();

      // mount the order resource
      api.use('/order', order({ config, db }));

      // mount the user resource
      api.use('/user', user({ config, db }));

      // mount the stock resource
      api.use('/stock', stock({ config, db }));

      // mount the review resource
      api.use('/review', review({ config, db }));

      // mount the cart resource
      api.use('/cart', cart({ config, db }));

      // mount the product resource
      api.use('/product', product({ config, db }))

      // mount the sync resource
      api.use('/sync', sync({ config, db }))

      // mount the url resource
      api.use('/url', url({ config, db }))

      // perhaps expose some API metadata at the root
      api.get('/', (req, res) => {
        res.json({ version });
      });

      registerExtensions({ app, config, db, registeredExtensions: config.get('modules.defaultVsf.registeredExtensions'), rootPath: path.join(__dirname, 'api', 'extensions') })

      // api router
      app.use('/api', api);
    }

  })
}
