import { StorefrontApiModule } from 'src/lib/module'
import { StorefrontApiContext, GraphqlConfiguration, ElasticSearchMappings } from 'src/lib/module/types'
import { Router } from 'express';
import img from './api/img'
import invalidateCache from './api/invalidate'
import order from './api/order';
import catalog from './api/catalog';
import user from './api/user';
import stock from './api/stock';
import review from './api/review';
import cart from './api/cart';
import product from './api/product';
import sync from './api/sync';
import middleware from './middleware'

import resolvers from './graphql/resolvers'
import schema from './graphql/schema'
import { loadSchema } from 'src/lib/elastic'
import path from 'path'
const version = require('package.json').version

export const DefaultVuestorefrontApiModule: StorefrontApiModule = new StorefrontApiModule({
  key: 'vsf-default',
  initMiddleware: ({ config, db, app }: StorefrontApiContext): void => {
    app.use(middleware({ config, db }));
  },
  loadMappings: ({ config, db, app }: StorefrontApiContext): ElasticSearchMappings => {
    return {
      schemas: {
        'product': loadSchema(path.join(__dirname, 'elasticsearch'), 'product', config.get('elasticsearch.apiVersion')),
        'attribute': loadSchema(path.join(__dirname, 'elasticsearch'), 'attribute', config.get('elasticsearch.apiVersion')),
        'category': loadSchema(path.join(__dirname, 'elasticsearch'), 'category', config.get('elasticsearch.apiVersion')),
        'cms_block': loadSchema(path.join(__dirname, 'elasticsearch'), 'cms_block', config.get('elasticsearch.apiVersion')),
        'cms_page': loadSchema(path.join(__dirname, 'elasticsearch'), 'cms_page', config.get('elasticsearch.apiVersion')),
        'taxrule': loadSchema(path.join(__dirname, 'elasticsearch'), 'cms_block', config.get('elasticsearch.apiVersion'))
      }}
  },
  initGraphql: ({ config, db, app }: StorefrontApiContext): GraphqlConfiguration => {
    return {
      resolvers,
      schema
    }
  },
  initApi: ({ config, db, app }: StorefrontApiContext): void => {
    let api = Router();

    // mount the catalog resource
    api.use('/catalog', catalog({ config, db }))

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

    /** Register the custom extensions */
    for (let ext of config.get('registeredExtensions') as string[]) {
      let entryPoint

      try {
        entryPoint = require('./api/extensions/' + ext)
      } catch (err) {
        try {
          entryPoint = require(ext)
        } catch (err) {
          console.error(err)
        }
      }

      if (entryPoint) {
        api.use('/' + ext, entryPoint({ config, db })) // a way to override the default module api's by the extension
        api.use('/ext/' + ext, entryPoint({ config, db })) // backward comaptibility
        console.log('Extension ' + ext + ' registered under /ext/' + ext + ' base URL')
      }
    }

    // api router
    app.use('/api', api);
    app.use('/img', img({ config, db })); // TODO: move to separate module
    app.use('/img/:width/:height/:action/:image', (req, res, next) => {
      console.log(req.params)
    });
    app.post('/invalidate', invalidateCache)
    app.get('/invalidate', invalidateCache)
  }

})
