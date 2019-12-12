import { apiStatus, apiError } from 'src/lib/util';
import { Router } from 'express';
import PlatformFactory from 'src/platform/factory';

export default ({ config, db }) => {
  let cartApi = Router();

  const _getProxy = (req) => {
    const platform = config.platform
    const factory = new PlatformFactory(config, req)
    return factory.getAdapter(platform, 'cart')
  };

  /**
   * POST create a cart
   * req.query.token - user token
   *
   * For authorized user:
   *
   * ```bash
   * curl 'http://localhost:8080/api/cart/create?token=xu8h02nd66yq0gaayj4x3kpqwity02or' -X POST
   * ```
   *
   * For anonymous user:
   *
   * ```bash
   * curl 'https://localhost:8080/api/cart/create' -X POST
   * ```
   *
   * Details: https://sfa-docs.now.sh/guide/default-modules/api.html#post-vsbridgecartcreate
   *
   */
  cartApi.post('/create', (req, res) => {
    const cartProxy = _getProxy(req)
    cartProxy.create(req.query.token).then((result) => {
      apiStatus(res, result, 200);
    }).catch(err => {
      apiError(res, err);
    })
  })

  /**
   * POST update or add the cart item
   *
   * Request body:
   *
   * {
   *   "cartItem":{
   *      "sku":"WS12-XS-Orange",
   *      "qty":1,
   *      "product_option":{
   *         "extension_attributes":{
   *            "custom_options":[
   *
   *               ],
   *            "configurable_item_options":[
   *            {
   *               "option_id":"93",
   *               "option_value":"56"
   *            },
   *            {
   *               "option_id":"142",
   *               "option_value":"167"
   *            }
   *            ],
   *            "bundle_options":[
   *
   *               ]
   *         }
   *      },
   *      "quoteId":"0a8109552020cc80c99c54ad13ef5d5a"
   *   }
   *}
   * Details: https://sfa-docs.now.sh/guide/default-modules/api.html#post-vsbridgecartupdate
   */
  cartApi.post('/update', (req, res) => {
    const cartProxy = _getProxy(req)
    if (!req.body.cartItem) {
      return apiStatus(res, 'No cartItem element provided within the request body', 500)
    }
    cartProxy.update(req.query.token, req.query.cartId ? req.query.cartId : null, req.body.cartItem).then((result) => {
      apiStatus(res, result, 200);
    }).catch(err => {
      apiError(res, err);
    })
  })

  /**
   * POST apply the coupon code
   *   req.query.token - user token
   *   req.query.cartId - cart Ids
   *   req.query.coupon - coupon
   *
   * ```bash
   * curl 'http://localhost:8080/api/cart/apply-coupon?token=2q1w9oixh3bukxyj947tiordnehai4td&cartId=5effb906a97ebecd6ae96e3958d04edc&coupon=ARMANi' -X POST -H 'content-type: application/json'
   * ```
   *
   * Details: https://sfa-docs.now.sh/guide/default-modules/api.html#post-vsbridgecartapply-coupon
   */
  cartApi.post('/apply-coupon', (req, res) => {
    const cartProxy = _getProxy(req)
    if (!req.query.coupon) {
      return apiStatus(res, 'No coupon code provided', 500)
    }
    cartProxy.applyCoupon(req.query.token, req.query.cartId ? req.query.cartId : null, req.query.coupon).then((result) => {
      apiStatus(res, result, 200);
    }).catch(err => {
      apiError(res, err);
    })
  })

  /**
   * POST remove the coupon code
   *   req.query.token - user token
   *   req.query.cartId - cart Ids
   *
   * ```bash
   * curl 'https://your-domain.example.com/vsbridge/cart/delete-coupon?token=2q1w9oixh3bukxyj947tiordnehai4td&cartId=5effb906a97ebecd6ae96e3958d04edc' -X POST -H 'content-type: application/json'
   * ```
   *
   * Details: https://sfa-docs.now.sh/guide/default-modules/api.html#post-vsbridgecartdelete-coupon
   */
  cartApi.post('/delete-coupon', (req, res) => {
    const cartProxy = _getProxy(req)
    cartProxy.deleteCoupon(req.query.token, req.query.cartId ? req.query.cartId : null).then((result) => {
      apiStatus(res, result, 200);
    }).catch(err => {
      apiError(res, err);
    })
  })

  /**
   * GET get the applied coupon code
   *   req.query.token - user token
   *   req.query.cartId - cart Ids
   *
   * ```bash
   * curl 'http://loccalhost:8080/api/cart/coupon?token=2q1w9oixh3bukxyj947tiordnehai4td&cartId=5effb906a97ebecd6ae96e3958d04edc' -H 'content-type: application/json'
   * ```
   *
   * Details: https://sfa-docs.now.sh/guide/default-modules/api.html#get-vsbridgecartcoupon
   */
  cartApi.get('/coupon', (req, res) => {
    const cartProxy = _getProxy(req)
    cartProxy.getCoupon(req.query.token, req.query.cartId ? req.query.cartId : null).then((result) => {
      apiStatus(res, result, 200);
    }).catch(err => {
      apiError(res, err);
    })
  })

  /**
   * POST delete the cart item
   *   req.query.token - user token
   *
   * Request body;
   * {
   *       "cartItem":
   *       {
   *          "sku":"MS10-XS-Black",
   *          "item_id":5853,
   *          "quoteId":"81668"
   *       }
   * }
   *
   * Details: https://sfa-docs.now.sh/guide/default-modules/api.html#post-vsbridgecartdelete
   */
  cartApi.post('/delete', (req, res) => {
    const cartProxy = _getProxy(req)
    if (!req.body.cartItem) {
      return apiStatus(res, 'No cartItem element provided within the request body', 500)
    }
    cartProxy.delete(req.query.token, req.query.cartId ? req.query.cartId : null, req.body.cartItem).then((result) => {
      apiStatus(res, result, 200);
    }).catch(err => {
      apiError(res, err);
    })
  })

  /**
   * GET pull the whole cart as it's currently se server side
   *   req.query.token - user token
   *   req.query.cartId - cartId
   *
   * For authorized users;
   *
   * ```bash
   * curl http://localhost:8080/api/cart/pull?token=xu8h02nd66yq0gaqwity02or
   * ```
   *
   * Details:
   * https://sfa-docs.now.sh/guide/default-modules/api.html#get-vsbridgecartpull
   */
  cartApi.get('/pull', (req, res) => {
    const cartProxy = _getProxy(req)
    res.setHeader('Cache-Control', 'no-cache, no-store');
    cartProxy.pull(req.query.token, req.query.cartId ? req.query.cartId : null, req.body).then((result) => {
      apiStatus(res, result, 200);
    }).catch(err => {
      apiError(res, err);
    })
  })

  /**
   * GET totals the cart totals
   *   req.query.token - user token
   *   req.query.cartId - cartId
   *
   * ```bash
   * curl 'http://localhost:8080/api/cart/totals?token=xu8h02nd66yq0gaayj4x3kpqwity02or&cartId=81668' -H 'content-type: application/json'
   * ```
   */
  cartApi.get('/totals', (req, res) => {
    const cartProxy = _getProxy(req)
    res.setHeader('Cache-Control', 'no-cache, no-store');
    cartProxy.totals(req.query.token, req.query.cartId ? req.query.cartId : null, req.body).then((result) => {
      apiStatus(res, result, 200);
    }).catch(err => {
      apiError(res, err);
    })
  })

  /**
   * POST /shipping-methods - available shipping methods for a given address
   *   req.query.token - user token
   *   req.query.cartId - cart ID if user is logged in, cart token if not
   *   req.body.address - shipping address object
   *
   * Request body:
   * {
   *       "address":
   *       {
   *          "country_id":"PL"
   *       }
   *    }
   *
   * ```bash
   * curl 'https://your-domain.example.com/vsbridge/cart/shipping-methods?token=xu8h02nd66yq0gaayj4x3kpqwity02or&cartId=81668' -H 'content-type: application/json' --data-binary '{"address":{"country_id":"PL"}}'
   *
   */
  cartApi.post('/shipping-methods', (req, res) => {
    const cartProxy = _getProxy(req)
    res.setHeader('Cache-Control', 'no-cache, no-store');
    if (!req.body.address) {
      return apiStatus(res, 'No address element provided within the request body', 500)
    }
    cartProxy.getShippingMethods(req.query.token, req.query.cartId ? req.query.cartId : null, req.body.address).then((result) => {
      apiStatus(res, result, 200);
    }).catch(err => {
      apiError(res, err);
    })
  })

  /**
   * GET /payment-methods - available payment methods
   *   req.query.token - user token
   *   req.query.cartId - cart ID if user is logged in, cart token if not
   *
   * ```bash
   * curl 'https://your-domain.example.com/vsbridge/cart/payment-methods?token=xu8h02nd66yq0gaayj4x3kpqwity02or&cartId=81668' -H 'content-type: application/json'
   *
   */
  cartApi.get('/payment-methods', (req, res) => {
    const cartProxy = _getProxy(req)
    res.setHeader('Cache-Control', 'no-cache, no-store');
    cartProxy.getPaymentMethods(req.query.token, req.query.cartId ? req.query.cartId : null).then((result) => {
      apiStatus(res, result, 200);
    }).catch(err => {
      apiError(res, err);
    })
  })

  /**
   * POST /shipping-information - set shipping information for collecting cart totals after address changed
   *   req.query.token - user token
   *   req.query.cartId - cart ID if user is logged in, cart token if not
   *   req.body.addressInformation - shipping address object
   *
   * Request body:
   * {
   *        "addressInformation":
   *        {
   *             "shipping_address":
   *          {
   *              "country_id":"PL"
   *          },
   *          "shipping_method_code":"flatrate",
   *           "shipping_carrier_code":"flatrate"
   *       }
   *    }
   */
  cartApi.post('/shipping-information', (req, res) => {
    const cartProxy = _getProxy(req)
    res.setHeader('Cache-Control', 'no-cache, no-store');
    if (!req.body.addressInformation) {
      return apiStatus(res, 'No address element provided within the request body', 500)
    }
    cartProxy.setShippingInformation(req.query.token, req.query.cartId ? req.query.cartId : null, req.body).then((result) => {
      apiStatus(res, result, 200);
    }).catch(err => {
      apiError(res, err);
    })
  })

  /**
   * POST totals the cart totals
   *   req.query.token - user token
   *   req.query.cartId - cartId
   *
   * ```bash
   * curl 'http://localhost:8080/api/cart/totals?token=xu8h02nd66yq0gaayj4x3kpqwity02or&cartId=81668' -H 'content-type: application/json'
   * ```
   */
  cartApi.post('/collect-totals', (req, res) => {
    const cartProxy = _getProxy(req)
    res.setHeader('Cache-Control', 'no-cache, no-store');
    if (!req.body.methods) {
      return apiStatus(res, 'No shipping and payment methods element provided within the request body', 500)
    }
    cartProxy.collectTotals(req.query.token, req.query.cartId ? req.query.cartId : null, req.body.methods).then((result) => {
      apiStatus(res, result, 200);
    }).catch(err => {
      apiError(res, err);
    })
  })

  return cartApi
}
