import { StorefrontApiModule, registerExtensions } from '@storefront-api/lib/module/index'
import { StorefrontApiContext, GraphqlConfiguration, ElasticSearchMappings } from '@storefront-api/lib/module/types'
import invalidateCache from './api/invalidate'
import catalog from './api/catalog';

import defaultProcessor from './processor/default'
import productProcessor from './processor/product'

import resolvers from './graphql/resolvers'
import schema from './graphql/schema'
import { loadSchema } from '@storefront-api/lib/elastic'
import path from 'path'
import ProcessorFactory from './processor/factory';

const catalogModule: StorefrontApiModule = new StorefrontApiModule({
  key: 'default-catalog',
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
      schema,
      hasGraphqlSupport: true
    }
  },
  initApi: ({ config, db, app }: StorefrontApiContext): void => {
    registerExtensions({ app, config, db, registeredExtensions: config.get('modules.defaultCatalog.registeredExtensions'), rootPath: path.join(__dirname, 'api', 'extensions') })

    // mount the catalog resource
    app.use('/api/catalog', catalog({ config, db }))
    app.post('/api/invalidate', invalidateCache)
    app.get('/api/invalidate', invalidateCache)
  }

})

export const DefaultCatalogModule = (processors = []): StorefrontApiModule => {
  ProcessorFactory.addAdapter('default', defaultProcessor)
  ProcessorFactory.addAdapter('product', productProcessor)
  processors.forEach(processor => {
    ProcessorFactory.addAdapter(processor.name, processor.class)
  })
  return catalogModule
}
