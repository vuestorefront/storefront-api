import AbstractReviewProxy from '@storefront-api/platform-abstract/review'
import { multiStoreConfig } from './util'
const Magento2Client = require('magento2-rest-client').Magento2Client;

class ReviewProxy extends AbstractReviewProxy {
  public constructor (config, req) {
    super(config, req)
    this.api = Magento2Client(multiStoreConfig(config.magento2.api, req));
  }

  public create (reviewData) {
    reviewData.entity_pk_value = reviewData.product_id
    delete reviewData.product_id

    return this.api.reviews.create(reviewData)
  }
}

export default ReviewProxy
