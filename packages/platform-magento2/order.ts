import AbstractOrderProxy from '@storefront-api/platform-abstract/order'
import Logger from '@storefront-api/lib/logger'
import { multiStoreConfig } from './util'
import { processSingleOrder } from './o2m'

class OrderProxy extends AbstractOrderProxy {
  public constructor (config, req) {
    const Magento2Client = require('magento2-rest-client').Magento2Client;
    super(config, req)
    this._config = config
    this.api = Magento2Client(multiStoreConfig(config.magento2.api, req));
  }

  public create (orderData) {
    const inst = this
    return new Promise((resolve, reject) => {
      try {
        processSingleOrder(orderData, inst._config, null, (error, result) => {
          Logger.error(error)
          if (error) reject(error)
          resolve(result)
        })
      } catch (e) {
        reject(e)
      }
    })
  }
}

export default OrderProxy
