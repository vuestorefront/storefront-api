import { Request } from 'express';
import { IConfig } from 'config';

abstract class AbstractCartProxy {
  protected _request: Request
  protected _config: IConfig
  public api: Record<string, Record<string, Function>>

  protected constructor (config, req) {
    this._config = config
    this._request = req
  }

  /*
    POST /api/cart/create
    #WHEN:
    This method is called when new Storefront shopping cart is created. First visit, page refresh, after user-authorization ... If the token GET parameter is provided it's called as logged-in user; if not - it's called as guest-user. To draw the difference - let's keep to Magento example. For guest user vue-storefront-api is subsequently operating on /guest-carts API endpoints and for authorized users on /carts/ endpoints)
    https://sfa-docs.now.sh/guide/default-modules/api.html#post-api-cart-create

    #GET PARAMS:
    token - null OR user token obtained from /api/user/login

    #EXAMPLE CALL:
    curl 'https://your-domain.example.com/api/cart/create' -X POST
    For authorized user:

    curl 'https://your-domain.example.com/api/cart/create?token=xu8h02nd66yq0gaayj4x3kpqwity02or' -X POST
    #RESPONSE BODY:
    For guest user

    {
        "code": 200,
        "result": "a17b9b5fb9f56652b8280bb94c52cd93"
    }
    The result is a guest-cart id that should be used for all subsequent cart related operations as ?cartId=a17b9b5fb9f56652b8280bb94c52cd93

    For authorized user

    {
        "code":200,
        "result":"81668"
    }
    The result is a cart-id that should be used for all subsequent cart related operations as ?cartId=81668

    #RESPONSE CODES:
    200 when success
    500 in case of error
  */
  public create (customerToken): Promise<any> { throw new Error('AbstractCartProxy::create must be implemented for specific platform') }

  /*
    POST /api/cart/update
    Method used to add or update shopping cart item's server side. As a request body there should be JSON given representing the cart item. sku and qty are the two required options. If you like to update/edit server cart item You need to pass item_id identifier as well (can be obtainted from api/cart/pull)
    https://sfa-docs.now.sh/guide/default-modules/api.html#post-api-cart-update

    #WHEN:
    This method is called just after api/cart/pull as a consequence of the synchronization process

    #GET PARAMS:
    token - null OR user token obtained from /api/user/login cartId - numeric (integer) value for authorized user cart id or GUID (mixed string) for guest cart ID obtained from api/cart/create

    #REQUEST BODY:
    {
      "cartItem":{
          "sku":"WS12-XS-Orange",
          "qty":1,
          "product_option":{
            "extension_attributes":{
                "custom_options":[

                ],
                "configurable_item_options":[
                  {
                      "option_id":"93",
                      "option_value":"56"
                  },
                  {
                      "option_id":"142",
                      "option_value":"167"
                  }
                ],
                "bundle_options":[

                ]
            }
          },
          "quoteId":"0a8109552020cc80c99c54ad13ef5d5a"
      }
    }
    #EXAMPLE CALL:
    curl 'https://your-domain.example.com/api/cart/update?token=xu8h02nd66yq0gaayj4x3kpqwity02or&cartId=81668' -H 'content-type: application/json' --data-binary '{"cartItem":{"sku":"MS10-XS-Black","item_id":5853,"quoteId":"81668"}}' --compressed
    #RESPONSE BODY:
    {
        "code":200,
        "result":
        {
            "item_id":5853,
            "sku":"MS10-XS-Black",
            "qty":2,
            "name":"Logan  HeatTec&reg; Tee-XS-Black",
            "price":24,
            "product_type":"simple",
            "quote_id":"81668"
        }
    }
  */
  public update (customerToken, cartId, cartItem): Promise<any> { throw new Error('AbstractCartProxy::update must be implemented for specific platform') }

  /*
    POST /api/cart/apply-coupon
    This method is used to apply the discount code to the current server side quote.
    https://sfa-docs.now.sh/guide/default-modules/api.html#post-api-cart-apply-coupon

    #EXAMPLE CALL:
    curl 'https://your-domain.example.com/api/cart/apply-coupon?token=2q1w9oixh3bukxyj947tiordnehai4td&cartId=5effb906a97ebecd6ae96e3958d04edc&coupon=ARMANI' -X POST -H 'content-type: application/json'
    #RESPONSE BODY:
    {
        "code":200,
        "result":true
    }
  */
  public applyCoupon (customerToken, cartId, coupon): Promise<any> { throw new Error('AbstractCartProxy::applyCoupon must be implemented for specific platform') }

  /*
    POST /api/cart/delete-coupon
    This method is used to delete the discount code to the current server side quote.

    #EXAMPLE CALL:
    curl 'https://your-domain.example.com/api/cart/delete-coupon?token=2q1w9oixh3bukxyj947tiordnehai4td&cartId=5effb906a97ebecd6ae96e3958d04edc' -X POST -H 'content-type: application/json'
    #RESPONSE BODY:
    {
        "code":200,
        "result":true
    }
  */
  public deleteCoupon (customerToken, cartId): Promise<any> { throw new Error('AbstractCartProxy::deleteCoupon must be implemented for specific platform') }

  /*
    GET /api/cart/coupon
    This method is used to get the currently applied coupon code

    #EXAMPLE CALL:
    curl 'https://your-domain.example.com/api/cart/coupon?token=2q1w9oixh3bukxyj947tiordnehai4td&cartId=5effb906a97ebecd6ae96e3958d04edc' -H 'content-type: application/json'
    #RESPONSE BODY:
    {
        "code":200,
        "result":"ARMANI"
    }
  */
  public getCoupon (customerToken, cartId): Promise<any> { throw new Error('AbstractCartProxy::getCoupon must be implemented for specific platform') }

  /*
    POST /api/cart/delete
    This method is used to remove the shopping cart item on server side.
    https://sfa-docs.now.sh/guide/default-modules/api.html#post-api-cart-delete

    #WHEN:
    This method is called just after api/cart/pull as a consequence of the synchronization process

    #GET PARAMS:
    token - null OR user token obtained from /api/user/login cartId - numeric (integer) value for authorized user cart id or GUID (mixed string) for guest cart ID obtained from api/cart/create

    #EXAMPLE CALL:
    curl 'https://your-domain.example.com/api/cart/delete?token=xu8h02nd66yq0gaayj4x3kpqwity02or&cartId=81668' -H 'content-type: application/json' --data-binary '{"cartItem":{"sku":"MS10-XS-Black","item_id":5853,"quoteId":"81668"}}' --compressed
    #REQUEST BODY:
    {
        "cartItem":
        {
            "sku":"MS10-XS-Black",
            "item_id":5853,
            "quoteId":"81668"
        }
    }
    #RESPONSE BODY:
    {
        "code":200,
        "result":true
    }
  */
  public delete (customerToken, cartId, cartItem): Promise<any> { throw new Error('AbstractCartProxy::delete must be implemented for specific platform') }

  /*
    GET /api/cart/pull
    Method used to fetch the current server side shopping cart content, used mostly for synchronization purposes when config.cart.synchronize=true
    https://sfa-docs.now.sh/guide/default-modules/api.html#get-api-cart-pull

    #WHEN:
    This method is called just after any Storefront cart modification to check if the server or client shopping cart items need to be updated. It gets the current list of the shopping cart items. The synchronization algorithm in VueStorefront determines if server or client items need to be updated and executes api/cart/update or api/cart/delete accordngly.

    #GET PARAMS:
    token - null OR user token obtained from /api/user/login cartId - numeric (integer) value for authorized user cart id or GUID (mixed string) for guest cart ID obtained from api/cart/create

    #RESPONSE BODY:
    {
      "code": 200,
      "result": [
        {
          "item_id": 66257,
          "sku": "WS08-M-Black",
          "qty": 1,
          "name": "Minerva LumaTech&trade; V-Tee",
          "price": 32,
          "product_type": "configurable",
          "quote_id": "dceac8e2172a1ff0cfba24d757653257",
          "product_option": {
            "extension_attributes": {
              "configurable_item_options": [
                {
                  "option_id": "93",
                  "option_value": 49
                },
                {
                  "option_id": "142",
                  "option_value": 169
                }
              ]
            }
          }
        },
        {
          "item_id": 66266,
          "sku": "WS08-XS-Red",
          "qty": 1,
          "name": "Minerva LumaTech&trade; V-Tee",
          "price": 32,
          "product_type": "configurable",
          "quote_id": "dceac8e2172a1ff0cfba24d757653257",
          "product_option": {
            "extension_attributes": {
              "configurable_item_options": [
                {
                  "option_id": "93",
                  "option_value": 58
                },
                {
                  "option_id": "142",
                  "option_value": 167
                }
              ]
            }
          }
        }
      ]
    }
 */
  public pull (customerToken, cartId, params): Promise<any> { throw new Error('AbstractCartProxy::pull must be implemented for specific platform') }

  /*
    GET /api/cart/totals
    Method called when the config.synchronize_totals=true just after any shopping cart modification. It's used to synchronize the Magento / other CMS totals after all promotion rules processed with current Storefront state.

    #EXAMPLE CALL:
    curl 'https://your-domain.example.com/api/cart/totals?token=xu8h02nd66yq0gaayj4x3kpqwity02or&cartId=81668' -H 'content-type: application/json'
    #GET PARAMS:
    token - null OR user token obtained from /api/user/login cartId - numeric (integer) value for authorized user cart id or GUID (mixed string) for guest cart ID obtained from api/cart/create

    #RESPONSE BODY:
    You have totals data for the current, synchronized quote returned:

    {
        "code":200,
        "result":
            {
                "grand_total":0,
                "base_currency_code":"USD",
                "quote_currency_code":"USD",
                "items_qty":1,
                "items":
                    [
                        {
                            "item_id":5853,
                            "price":0,
                            "qty":1,
                            "row_total":0,
                            "row_total_with_discount":0,
                            "tax_amount":0,
                            "tax_percent":0,
                            "discount_amount":0,
                            "base_discount_amount":0,
                            "discount_percent":0,
                            "name":"Logan  HeatTec&reg; Tee-XS-Black",
                            "options": "[{ \"label\": \"Color\", \"value\": \"red\" }, { \"label\": \"Size\", \"value\": \"XL\" }]",
                            "product_option":{
                              "extension_attributes":{
                                  "custom_options":[

                                  ],
                                  "configurable_item_options":[
                                    {
                                        "option_id":"93",
                                        "option_value":"56"
                                    },
                                    {
                                        "option_id":"142",
                                        "option_value":"167"
                                    }
                                  ],
                                  "bundle_options":[

                                  ]
                              }
                            }
                        }
                    ],
                "total_segments":
                    [
                        {
                            "code":"subtotal",
                            "title":"Subtotal",
                            "value":0
                        },
                        {
                            "code":"shipping",
                            "title":"Shipping & Handling",
                            "value":null
                        },
                        {
                            "code":"tax",
                            "title":"Tax",
                            "value":0,
                            "extension_attributes":
                                {
                                    "tax_grandtotal_details":[]
                                }
                        },
                        {
                            "code":"grand_total",
                            "title":"Grand Total",
                            "value":null,
                            "area":"footer"
                        }
                    ]
            }
    }
  */
  public totals (customerToken, cartId, params): Promise<any> { throw new Error('AbstractCartProxy::totals must be implemented for specific platform') }

  /*
    POST /api/cart/shipping-methods
    This method is used as a step in the cart synchronization process to get all the shipping methods with actual costs as available inside the backend CMS

    #EXAMPLE CALL:
    curl 'https://your-domain.example.com/api/cart/shipping-methods?token=xu8h02nd66yq0gaayj4x3kpqwity02or&cartId=81668' -H 'content-type: application/json' --data-binary '{"address":{"country_id":"PL"}}'
    #GET PARAMS:
    token - null OR user token obtained from /api/user/login cartId - numeric (integer) value for authorized user cart id or GUID (mixed string) for guest cart ID obtained from api/cart/create

    #REQUEST BODY:
    If the shipping methods are dependend on the full address - probably we need to pass the whole address record with the same format as it's passed to api/order/create or api/user/me. The minimum required field is the country_id

    {
        "address":
        {
            "country_id":"PL"
        }
    }
    #RESPONSE BODY:
    {
        "code":200,
        "result":
        [
            {
                "carrier_code":"flatrate",
                "method_code":"flatrate",
                "carrier_title":"Flat Rate",
                "method_title":"Fixed",
                "amount":5,
                "base_amount":5
                ,"available":true,
                "error_message":"",
                "price_excl_tax":5,
                "price_incl_tax":5
            }
        ]
    }
 */
  public getShippingMethods (customerToken, cartId, address): Promise<any> { throw new Error('AbstractCartProxy::getShippingMethods must be implemented for specific platform') }

  /*
    GET /api/cart/payment-methods
    This method is used as a step in the cart synchronization process to get all the payment methods with actual costs as available inside the backend CMS

    #EXAMPLE CALL:
    curl 'https://your-domain.example.com/api/cart/payment-methods?token=xu8h02nd66yq0gaayj4x3kpqwity02or&cartId=81668' -H 'content-type: application/json'
    #GET PARAMS:
    token - null OR user token obtained from /api/user/login cartId - numeric (integer) value for authorized user cart id or GUID (mixed string) for guest cart ID obtained from api/cart/create

    #RESPONSE BODY:
    {
        "code":200,
        "result":
            [
                {
                    "code":"cashondelivery",
                    "title":"Cash On Delivery"
                },
                {
                    "code":"checkmo","title":
                    "Check / Money order"
                },
                {
                    "code":"free",
                    "title":"No Payment Information Required"
                }
            ]
    }
  */
  public getPaymentMethods (customerToken, cartId): Promise<any> { throw new Error('AbstractCartProxy::getPaymentMethods must be implemented for specific platform') }

  /*
    POST /api/cart/shipping-information
    This method sets the shipping information on specified quote which is a required step before calling api/cart/totals
    https://sfa-docs.now.sh/guide/default-modules/api.html#post-api-cart-shipping-information

    #EXAMPLE CALL:
    curl 'https://your-domain.example.com/api/cart/shipping-information?token=xu8h02nd66yq0gaayj4x3kpqwity02or&cartId=81668' -H 'content-type: application/json' --data-binary '{"addressInformation":{"shipping_address":{"country_id":"PL"},"shipping_method_code":"flatrate","shipping_carrier_code":"flatrate"}}'
    #GET PARAMS:
    token - null OR user token obtained from /api/user/login cartId - numeric (integer) value for authorized user cart id or GUID (mixed string) for guest cart ID obtained from api/cart/create

    #REQUEST BODY:
    {
        "addressInformation":
        {
            "shipping_address":
            {
                "country_id":"PL"
            },
            "shipping_method_code":"flatrate",
            "shipping_carrier_code":"flatrate"
        }
    }
    #RESPONSE BODY:
    {
      "code": 200,
      "result": {
        "payment_methods": [
          {
            "code": "cashondelivery",
            "title": "Cash On Delivery"
          },
          {
            "code": "checkmo",
            "title": "Check / Money order"
          }
        ],
        "totals": {
          "grand_total": 45.8,
          "subtotal": 48,
          "discount_amount": -8.86,
          "subtotal_with_discount": 39.14,
          "shipping_amount": 5,
          "shipping_discount_amount": 0,
          "tax_amount": 9.38,
          "shipping_tax_amount": 0,
          "base_shipping_tax_amount": 0,
          "subtotal_incl_tax": 59.04,
          "shipping_incl_tax": 5,
          "base_currency_code": "USD",
          "quote_currency_code": "USD",
          "items_qty": 2,
          "items": [
            {
              "item_id": 5853,
              "price": 24,
              "qty": 2,
              "row_total": 48,
              "row_total_with_discount": 0,
              "tax_amount": 9.38,
              "tax_percent": 23,
              "discount_amount": 8.86,
              "discount_percent": 15,
              "price_incl_tax": 29.52,
              "row_total_incl_tax": 59.04,
              "base_row_total_incl_tax": 59.04,
              "options": "[]",
              "name": "Logan  HeatTec&reg; Tee-XS-Black"
            }
          ],
          "total_segments": [
            {
              "code": "subtotal",
              "title": "Subtotal",
              "value": 59.04
            },
            {
              "code": "shipping",
              "title": "Shipping & Handling (Flat Rate - Fixed)",
              "value": 5
            },
            {
              "code": "discount",
              "title": "Discount",
              "value": -8.86
            },
            {
              "code": "tax",
              "title": "Tax",
              "value": 9.38,
              "area": "taxes",
              "extension_attributes": {
                "tax_grandtotal_details": [
                  {
                    "amount": 9.38,
                    "rates": [
                      {
                        "percent": "23",
                        "title": "VAT23"
                      }
                    ],
                    "group_id": 1
                  }
                ]
              }
            },
            {
              "code": "grand_total",
              "title": "Grand Total",
              "value": 55.18,
              "area": "footer"
            }
          ]
        }
      }
    }
  */
  public setShippingInformation (customerToken, cartId, address): Promise<any> { throw new Error('AbstractCartProxy::setShippingInformation must be implemented for specific platform') }
  public collectTotals (customerToken, cartId, shippingMethod): Promise<any> { throw new Error('AbstractCartProxy::collectTotals must be implemented for specific platform') }
}

export default AbstractCartProxy;
