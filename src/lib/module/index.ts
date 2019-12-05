// @deprecated from 2.0
import { StorefrontApiContext, StorefrontApiModuleConfig, GraphqlConfiguration, DbContext, ElasticSearchMappings } from './types'
import { IConfig } from 'config'
import { IRouter } from 'express'
import path from 'path'
import merge from 'deepmerge'

const registeredModules: StorefrontApiModuleConfig[] = []
const aggregatedGraphqlConfig: GraphqlConfiguration = { schema: [], resolvers: [], hasGraphqlSupport: false }
const aggregatedElasticSearchSchema: ElasticSearchMappings = { schemas: {} }

function registerModules (modules: StorefrontApiModule[], context): {
  registeredModules: StorefrontApiModule[],
  aggregatedGraphqlConfig: GraphqlConfiguration,
  aggregatedElasticSearchSchema: ElasticSearchMappings
} {
  modules.forEach(m => m.register(context))
  console.log('API Modules registration finished.', {
    succesfulyRegistered: registeredModules.length + ' / ' + modules.length,
    registrationOrder: registeredModules
  }
  )

  return {
    registeredModules: modules,
    aggregatedGraphqlConfig,
    aggregatedElasticSearchSchema
  }
}

function aggregateElasticSearchSchema (modules: StorefrontApiModule[], context): ElasticSearchMappings {
  modules.forEach(m => {
    m.aggregateElasticSearchSchema(context)
  })

  return aggregatedElasticSearchSchema
}

class StorefrontApiModule {
  private _isRegistered = false
  private _c: StorefrontApiModuleConfig
  public constructor (_c: StorefrontApiModuleConfig) {
    this._c = _c
  }

  public get config () {
    return this._c
  }

  /** Use only if you want to explicitly modify module config. Otherwise it's much easier to use `extendModule` */
  public set config (config) {
    this._c = config
  }

  public aggregateElasticSearchSchema (context: StorefrontApiContext): void {
    if (this._c.loadMappings) {
      const elasticMappings = this._c.loadMappings(context)
      if (elasticMappings && elasticMappings.schemas) {
        aggregatedElasticSearchSchema.schemas = merge(aggregatedElasticSearchSchema.schemas, elasticMappings.schemas) // merge schemas
      }
    }
  }
  public aggreagateGraphqlSchema (context: StorefrontApiContext): void {
    if (this._c.initGraphql) {
      const gqlModuleConfig = this._c.initGraphql(context)
      if (gqlModuleConfig.resolvers.length > 0) {
        aggregatedGraphqlConfig.hasGraphqlSupport = true
        aggregatedGraphqlConfig.resolvers = aggregatedGraphqlConfig.resolvers.concat(gqlModuleConfig.resolvers)
        aggregatedGraphqlConfig.schema = aggregatedGraphqlConfig.schema.concat(gqlModuleConfig.schema)
      }
    }
  }
  public register (context: StorefrontApiContext): StorefrontApiModuleConfig | void {
    if (!this._isRegistered) {
      if (this._c.beforeRegistration) {
        this._c.beforeRegistration(context)
      }
      // register the module:
      if (this._c.initApi) {
        this._c.initApi(context)
      }
      this.aggreagateGraphqlSchema(context)
      this.aggregateElasticSearchSchema(context)
      if (this._c.initMiddleware) {
        this._c.initMiddleware(context)
      }
      registeredModules.push(this._c)
      this._isRegistered = true
      if (this._c.afterRegistration) {
        this._c.afterRegistration(context)
      }
      return this._c
    }
  }
}

interface ExtensionContext { config: IConfig, app: IRouter, db: DbContext, registeredExtensions: string[], rootPath: string }
function registerExtensions (context: ExtensionContext): void {
  /** Register the custom extensions */
  for (let ext of context.registeredExtensions as string[]) {
    let entryPoint

    try {
      entryPoint = require(path.join(context.rootPath, ext))
    } catch (err) {
      try {
        entryPoint = require(ext)
      } catch (err) {
        console.error(err)
      }
    }

    if (entryPoint) {
      const route = entryPoint({ context: context.config, db: context.db })
      context.app.use('/api/' + ext, route) // a way to override the default module api's by the extension
      context.app.use('/api/ext/' + ext, route) // backward comaptibility
      console.log('Extension ' + ext + ' registered under /ext/' + ext + ' base URL')
    }
  }
}

export {
  StorefrontApiModuleConfig,
  StorefrontApiModule,
  registerModules,
  registerExtensions,
  aggregateElasticSearchSchema
}
