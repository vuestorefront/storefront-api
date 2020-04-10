import { StorefrontApiModule, registerExtensions } from '@storefront-api/lib/module'
import { StorefrontApiContext } from '@storefront-api/lib/module/types'
import { Router } from 'express';
import order from './api/order';
import user from './api/user';
import stock from './api/stock';
import cart from './api/cart';
import catalog from './api/catalog'
import img from './api/img'
import { version } from '../../../package.json';
import path from 'path'

export const SampleApiModule: StorefrontApiModule = new StorefrontApiModule({
  key: 'sample-api',

  initApi: ({ config, db, app }: StorefrontApiContext): void => {
    let api = Router();

    // mount the order resource
    api.use('/order', order({ config, db }));

    // mount the user resource
    api.use('/user', user({ config, db }));

    // mount the stock resource
    api.use('/stock', stock({ config, db }));

    // mount the cart resource
    api.use('/cart', cart({ config, db }));

    // mount the catalog resource
    api.use('/catalog', catalog({ config, db }))

    api.use('/img', img({ config, db }));
    api.use('/img/:width/:height/:action/:image', (req, res, next) => {
      console.log(req.params)
    });

    // perhaps expose some API metadata at the root
    api.get('/', (req, res) => {
      res.json({ version });
    });

    registerExtensions({ app, config, db, registeredExtensions: config.get('modules.sampleApi.registeredExtensions'), rootPath: path.join(__dirname, 'api', 'extensions') })

    // api router
    app.use('/sample-api', api);
  }

})
