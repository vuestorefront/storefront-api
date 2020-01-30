import AbstractWishlistProxy from '@storefront-api/platform-abstract/wishlist';
import { multiStoreConfig } from './util';

class WishlistProxy extends AbstractWishlistProxy {
  public constructor (config, req) {
    const Magento1Client = require('magento1-vsbridge-client').Magento1Client;
    super(config, req)
    this.api = Magento1Client(multiStoreConfig(config.magento1.api, req));
  }
  public pull (customerToken) {
    return this.api.wishlist.pull(customerToken);
  }
  public update (customerToken, wishListItem) {
    return this.api.wishlist.update(customerToken, wishListItem);
  }
  public delete (customerToken, wishListItem) {
    return this.api.wishlist.delete(customerToken, wishListItem);
  }
}

export default WishlistProxy;
