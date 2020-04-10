import resource from 'resource-router-middleware';
import { apiStatus, apiError } from '@storefront-api/lib/util';
import { merge } from 'lodash';
import PlatformFactory from '@storefront-api/platform/factory';
import AbstractOrderProxy from '@storefront-api/platform-abstract/order';
import Logger from '@storefront-api/lib/logger'

const Ajv = require('ajv'); // json validator
const fs = require('fs');
const kue = require('kue');
const jwa = require('jwa');
const hmac = jwa('HS256');

const _getProxy = (req, config): AbstractOrderProxy => {
  const platform = config.platform
  const factory = new PlatformFactory(config, req)
  return factory.getAdapter(platform, 'order')
};

export default ({ config, db }) => resource({

  /** Property name to store preloaded entity on `request`. */
  id: 'order',

  /**
   * POST create an order
   *
   * Request body:
   *
   * {
   *   "user_id": "",
   *   "cart_id": "d90e9869fbfe3357281a67e3717e3524",
   *   "products": [
   *      {
   *           "sku": "WT08-XS-Yellow",
   *          "qty": 1
   *       }
   *   ],
   *   "addressInformation": {
   *       "shippingAddress": {
   *           "region": "",
   *           "region_id": 0,
   *           "country_id": "PL",
   *           "street": [
   *               "Example",
   *               "12"
   *           ],
   *           "company": "NA",
   *           "telephone": "",
   *           "postcode": "50-201",
   *           "city": "Wroclaw",
   *           "firstname": "Piotr",
   *           "lastname": "Karwatka",
   *           "email": "pkarwatka30@divante.pl",
   *           "region_code": ""
   *       },
   *       "billingAddress": {
   *           "region": "",
   *           "region_id": 0,
   *           "country_id": "PL",
   *           "street": [
   *                "Example",
   *               "12"
   *           ],
   *           "company": "Company name",
   *           "telephone": "",
   *           "postcode": "50-201",
   *           "city": "Wroclaw",
   *           "firstname": "Piotr",
   *           "lastname": "Karwatka",
   *           "email": "pkarwatka30@divante.pl",
   *           "region_code": "",
   *           "vat_id": "PL88182881112"
   *       },
   *       "shipping_method_code": "flatrate",
   *       "shipping_carrier_code": "flatrate",
   *       "payment_method_code": "cashondelivery",
   *       "payment_method_additional": {}
   *   },
   *   "order_id": "1522811662622-d3736c94-49a5-cd34-724c-87a3a57c2750",
   *   "transmited": false,
   *   "created_at": "2018-04-04T03:14:22.622Z",
   *   "updated_at": "2018-04-04T03:14:22.622Z"
   *  }
   */
  /*
    #RESPONSE BODY:
    {
        "code":200,
        "result":"OK"
    }
  */
  create (req, res) {
    const ajv = new Ajv();
    require('ajv-keywords')(ajv, 'regexp');

    const orderSchema = require('../models/order.schema.js')
    let orderSchemaExtension = {}
    if (fs.existsSync('../models/order.schema.extension.json')) {
      orderSchemaExtension = require('../models/order.schema.extension.json')
    }
    const validate = ajv.compile(merge(orderSchema, orderSchemaExtension));

    if (!validate(req.body)) { // schema validation of upcoming order
      console.dir(validate.errors);
      apiStatus(res, validate.errors, 400);
      return;
    }
    const incomingOrder = { title: 'Incoming order received on ' + new Date() + ' / ' + req.ip, ip: req.ip, agent: req.headers['user-agent'], receivedAt: new Date(), order: req.body }/* parsed using bodyParser.json middleware */
    Logger.info(JSON.stringify(incomingOrder))

    for (let product of req.body.products) {
      let key = config.tax.calculateServerSide ? { priceInclTax: product.priceInclTax, id: null, sku: null } : { price: product.price, id: null, sku: null }
      if (config.tax.alwaysSyncPlatformPricesOver) {
        key.id = product.id
      } else {
        key.sku = product.sku
      }
      // Logger.info(key)

      if (!config.tax.usePlatformTotals) {
        if (!hmac.verify(key, product.sgn, config.objHashSecret)) {
          Logger.error('Invalid hash for ' + product.sku + ': ' + product.sgn)
          apiStatus(res, 'Invalid signature validation of ' + product.sku, 200);
          return;
        }
      }
    }

    if (config.orders.useServerQueue) {
      try {
        let queue = kue.createQueue(Object.assign(config.kue, { redis: config.redis }));
        const job = queue.create('order', incomingOrder).save((err) => {
          if (err) {
            Logger.error(err)
            apiError(res, err);
          } else {
            apiStatus(res, job.id, 200);
          }
        })
      } catch (e) {
        apiStatus(res, e, 500);
      }
    } else {
      const orderProxy = _getProxy(req, config)
      orderProxy.create(req.body).then((result) => {
        apiStatus(res, result, 200);
      }).catch(err => {
        apiError(res, err);
      })
    }
  }
})
