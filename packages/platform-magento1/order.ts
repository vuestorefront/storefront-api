import AbstractOrderProxy from '@storefront-api/platform-abstract/order'
import { multiStoreConfig } from './util'

class OrderProxy extends AbstractOrderProxy {
  public constructor (config, req) {
    const Magento1Client = require('magento1-vsbridge-client').Magento1Client;
    super(config, req)
    this.api = Magento1Client(multiStoreConfig(config.magento1.api, req));
  }

  public create (orderData) {
    return this.api.order.create(orderData);
  }
}

export default OrderProxy
