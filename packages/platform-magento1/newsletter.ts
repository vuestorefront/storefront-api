import AbstractNewsletterProxy from '@storefront-api/platform-abstract/newsletter';
import { multiStoreConfig } from './util';

class NewsletterProxy extends AbstractNewsletterProxy {
  public constructor (config, req) {
    const Magento1Client = require('magento1-vsbridge-client').Magento1Client;
    super(config, req)
    this.api = Magento1Client(multiStoreConfig(config.magento1.api, req));
  }
  public subscribe (emailAddress) {
    return this.api.newsletter.subscribe(emailAddress);
  }
  public unsubscribe (customerToken) {
    return this.api.newsletter.unsubscribe(customerToken);
  }
}

export default NewsletterProxy;
