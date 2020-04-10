import AbstractUserProxy from '@storefront-api/platform-abstract/user'
import { multiStoreConfig } from './util'

class StockProxy extends AbstractUserProxy {
  public constructor (config, req) {
    const Magento2Client = require('magento2-rest-client').Magento2Client;
    super(config, req)
    this.api = Magento2Client(multiStoreConfig(config.magento2.api, req));
  }

  public check ({sku, stockId = 0}) {
    return this.api.stockItems.list(sku).then((result) => {
      if (this._config.get('msi.enabled')) {
        return this.api.stockItems.getSalableQty(sku, stockId).then((salableQty) => {
          result.qty = salableQty;
          return result;
        }).then((result) => {
          return this.api.stockItems.isSalable(sku, stockId).then((isSalable) => {
            result.is_in_stock = isSalable;
            return result
          })
        })
      } else {
        return result;
      }
    })
  }
}

export default StockProxy
