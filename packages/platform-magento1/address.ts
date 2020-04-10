import AbstractAddressProxy from '@storefront-api/platform-abstract/address'
import {multiStoreConfig} from './util';

class AddressProxy extends AbstractAddressProxy {
  public constructor (config, req) {
    const Magento1Client = require('magento1-vsbridge-client').Magento1Client;
    super(config, req)
    this.api = Magento1Client(multiStoreConfig(config.magento1.api, req));
  }

  public list (customerToken) {
    return this.api.address.list(customerToken)
  }

  public update (customerToken, addressData) {
    return this.api.address.update(customerToken, addressData);
  }

  public get (customerToken, addressId) {
    return this.api.address.get(customerToken, addressId)
  }

  public delete (customerToken, addressData) {
    return this.api.address.delete(customerToken, addressData)
  }
}

export default AddressProxy
