'use strict';
import Logger from '@storefront-api/lib/logger'

/**
 * Check if the module exists
 * @param module name name
 */
function module_exists (name) {
  try { return require.resolve(name) } catch (e) { return false }
}

export class ProcessorFactory {
  private config: any
  public static processors: Record<string, any> = {}
  public constructor (app_config) {
    this.config = app_config;
  }

  public static addAdapter (name: string, object: Record<any, any>) {
    ProcessorFactory.processors[name] = object
  }

  public getAdapter (entityType, indexName, req, res) {
    let AdapterClass
    if (ProcessorFactory.processors[entityType]) {
      AdapterClass = ProcessorFactory.processors[entityType]
    } else {
      const moduleName = './' + entityType

      if (!module_exists(moduleName)) {
        Logger.info('No additional data adapter for ' + entityType)
        return null
      }

      AdapterClass = require(moduleName);
    }

    if (!AdapterClass) {
      Logger.info('No additional data adapter for ' + entityType)
      return null
    } else {
      let adapter_instance = new AdapterClass(this.config, entityType, indexName, req, res);

      if ((typeof adapter_instance.isValidFor === 'function') && !adapter_instance.isValidFor(entityType)) { throw new Error('Not valid adapter class or adapter is not valid for ' + entityType); }

      return adapter_instance;
    }
  }
}

export default ProcessorFactory;
