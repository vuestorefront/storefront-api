import { StorefrontApiModule, registerExtensions } from 'src/lib/module'
import { StorefrontApiContext, GraphqlConfiguration, ElasticSearchMappings } from 'src/lib/module/types'
import invalidateCache from './api/invalidate'
import catalog from './api/catalog';

import resolvers from '../default-catalog/graphql/resolvers'
import schema from '../default-catalog/graphql/schema'
import { loadSchema } from 'src/lib/elastic'
import path from 'path'

export const DefaultCatalogModule: StorefrontApiModule = new StorefrontApiModule({
  key: 'vsf-default',
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
