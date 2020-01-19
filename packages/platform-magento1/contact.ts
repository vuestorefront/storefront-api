import AbstractContactProxy from '@storefront-api/platform-abstract/contact';
import { multiStoreConfig } from './util';

class ContactProxy extends AbstractContactProxy {
  public constructor (config, req) {
    const Magento1Client = require('magento1-vsbridge-client').Magento1Client;
    super(config, req)
    this.api = Magento1Client(multiStoreConfig(config.magento1.api, req));
  }
  public submit (form) {
    return this.api.contact.submit(form);
  }
}

export default ContactProxy;
