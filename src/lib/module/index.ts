// @deprecated from 2.0
import { StorefrontApiContext, StorefrontApiModuleConfig, GraphqlConfiguration } from './types'

const registeredModules: StorefrontApiModuleConfig[] = []
const aggregatedGraphqlConfig: GraphqlConfiguration = { schema: [], resolvers: [] }

function registerModules (modules: StorefrontApiModule[], context): {
  registeredModules: StorefrontApiModule[],
  aggregatedGraphqlConfig: GraphqlConfiguration
} {
  modules.forEach(m => m.register(context))
  console.log('API Modules registration finished.', {
    succesfulyRegistered: registeredModules.length + ' / ' + modules.length,
    registrationOrder: registeredModules
  }
  )

  return {
    registeredModules: modules,
    aggregatedGraphqlConfig
  }
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

  public register (context: StorefrontApiContext): StorefrontApiModuleConfig | void {
    if (!this._isRegistered) {
      if (this._c.beforeRegistration) {
        this._c.beforeRegistration(context)
      }
      // register the module:
      if (this._c.initApi) {
        this._c.initApi(context)
      }
      if (this._c.initGraphql) {
        const gqlModuleConfig = this._c.initGraphql(context)
        aggregatedGraphqlConfig.resolvers = aggregatedGraphqlConfig.resolvers.concat(gqlModuleConfig.resolvers)
        aggregatedGraphqlConfig.schema = aggregatedGraphqlConfig.schema.concat(gqlModuleConfig.schema)
      }
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

export {
  StorefrontApiModuleConfig,
  StorefrontApiModule,
  registerModules
}
