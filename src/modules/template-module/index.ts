import { StorefrontApiModule, registerExtensions } from 'src/lib/module'
import { StorefrontApiContext, GraphqlConfiguration, ElasticSearchMappings } from 'src/lib/module/types'
import { Router } from 'express'
import resolvers from './graphql/resolvers'
import schema from './graphql/schema'

import path from 'path'
import version from './api/version'
import { loadSchema } from 'src/lib/elastic'

export const TemplateModule: StorefrontApiModule = new StorefrontApiModule({
  key: 'template-module',

  initGraphql: ({ config, db, app }: StorefrontApiContext): GraphqlConfiguration => {
    return {
      resolvers,
      schema,
      hasGraphqlSupport: true
    }
  },

  loadMappings: ({ config, db, app }: StorefrontApiContext): ElasticSearchMappings => {
    return {
      schemas: {
        'custom': loadSchema(path.join(__dirname, 'elasticsearch'), 'custom', config.get('elasticsearch.apiVersion'))
      }}
  },

  initApi: ({ config, db, app }: StorefrontApiContext): void => {
    let api = Router();

    // mount the order resource
    api.use('/version', version({ config, db }));
    registerExtensions({ app, config, db, registeredExtensions: config.get('modules.templateModule.registeredExtensions'), rootPath: path.join(__dirname, 'api', 'extensions') })

    // api router
    app.use('/template', api);
  }
})
