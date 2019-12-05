import { StorefrontApiModule, registerExtensions } from 'src/lib/module'
import { StorefrontApiContext } from 'src/lib/module/types'
import { Router } from 'express';
import order from './api/order';
import user from './api/user';
import stock from './api/stock';
import review from './api/review';
import cart from './api/cart';
import product from './api/product';
import sync from './api/sync';
import middleware from './middleware'

import path from 'path'
const version = require('package.json').version

export const DefaultVuestorefrontApiModule: StorefrontApiModule = new StorefrontApiModule({
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

    // perhaps expose some API metadata at the root
    api.get('/', (req, res) => {
      res.json({ version });
    });

    registerExtensions({ app, config, db, registeredExtensions: config.get('modules.defaultVsf.registeredExtensions'), rootPath: path.join(__dirname, 'api', 'extensions') })

    // api router
    app.use('/api', api);
  }

})
