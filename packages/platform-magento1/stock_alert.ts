import AbstractStockAlertProxy from '@storefront-api/platform-abstract/stock_alert';
import { multiStoreConfig } from './util';

class StockAlertProxy extends AbstractStockAlertProxy {
  public constructor (config, req) {
    const Magento1Client = require('magento1-vsbridge-client').Magento1Client;
    super(config, req)
    this.api = Magento1Client(multiStoreConfig(config.magento1.api, req));
  }
  public subscribe (customerToken, productId, emailAddress) {
    return this.api.stockAlert.subscribe(customerToken, productId, emailAddress);
  }
}

export default StockAlertProxy;
