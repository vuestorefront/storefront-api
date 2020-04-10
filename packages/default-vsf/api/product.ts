import { apiStatus, sgnSrc, apiError } from '@storefront-api/lib/util';
import { Router } from 'express';
import PlatformFactory from '@storefront-api/platform/factory';
import AbstractProductProxy from '@storefront-api/platform-abstract/product';

import jwa from 'jwa';
const hmac = jwa('HS256');

export default ({ config, db }) => {
  let productApi = Router();

  const _getProxy = (req): AbstractProductProxy => {
    const platform = config.platform
    const factory = new PlatformFactory(config, req)
    return factory.getAdapter(platform, 'product')
  };

  /**
   * GET get products info
   */
  /*
    #RESPONSE BODY:
    For list:

    {
      "code": 200,
      "result": {
        "items": [
          {
            "id": 1866,
            "sku": "WP07",
            "name": "Aeon Capri",
            "price": 0,
            "status": 1,
            "visibility": 4,
            "type_id": "configurable",
            "created_at": "2017-11-06 12:17:26",
            "updated_at": "2017-11-06 12:17:26",
            "product_links": [],
            "tier_prices": [],
            "custom_attributes": [
              {
                "attribute_code": "description",
                "value": "<p>Reach for the stars and beyond in these Aeon Capri pant. With a soft, comfortable feel and moisture wicking fabric, these duo-tone leggings are easy to wear -- and wear attractively.</p>\n<p>&bull; Black capris with teal accents.<br />&bull; Thick, 3\" flattering waistband.<br />&bull; Media pocket on inner waistband.<br />&bull; Dry wick finish for ultimate comfort and dryness.</p>"
              },
              {
                "attribute_code": "image",
                "value": "/w/p/wp07-black_main.jpg"
              },
              {
                "attribute_code": "category_ids",
                "value": [
                  "27",
                  "32",
                  "35",
                  "2"
                ]
              },
              {
                "attribute_code": "url_key",
                "value": "aeon-capri"
              },
              {
                "attribute_code": "tax_class_id",
                "value": "2"
              },
              {
                "attribute_code": "eco_collection",
                "value": "0"
              },
              {
                "attribute_code": "performance_fabric",
                "value": "1"
              },
              {
                "attribute_code": "erin_recommends",
                "value": "0"
              },
              {
                "attribute_code": "new",
                "value": "0"
              },
              {
                "attribute_code": "sale",
                "value": "0"
              },
              {
                "attribute_code": "style_bottom",
                "value": "107"
              },
              {
                "attribute_code": "pattern",
                "value": "195"
              },
              {
                "attribute_code": "climate",
                "value": "205,212,206"
              }
            ]
          }
        ],
        "search_criteria": {
          "filter_groups": [
            {
              "filters": [
                {
                  "field": "sku",
                  "value": "WP07",
                  "condition_type": "in"
                }
              ]
            }
          ]
        },
        "total_count": 1
      }
    }
    For render-list:

    {
      "code": 200,
      "result": {
        "items": [
          {
            "price_info": {
              "final_price": 59.04,
              "max_price": 59.04,
              "max_regular_price": 59.04,
              "minimal_regular_price": 59.04,
              "special_price": null,
              "minimal_price": 59.04,
              "regular_price": 48,
              "formatted_prices": {
                "final_price": "<span class=\"price\">$59.04</span>",
                "max_price": "<span class=\"price\">$59.04</span>",
                "minimal_price": "<span class=\"price\">$59.04</span>",
                "max_regular_price": "<span class=\"price\">$59.04</span>",
                "minimal_regular_price": null,
                "special_price": null,
                "regular_price": "<span class=\"price\">$48.00</span>"
              },
              "extension_attributes": {
                "tax_adjustments": {
                  "final_price": 47.999999,
                  "max_price": 47.999999,
                  "max_regular_price": 47.999999,
                  "minimal_regular_price": 47.999999,
                  "special_price": 47.999999,
                  "minimal_price": 47.999999,
                  "regular_price": 48,
                  "formatted_prices": {
                    "final_price": "<span class=\"price\">$48.00</span>",
                    "max_price": "<span class=\"price\">$48.00</span>",
                    "minimal_price": "<span class=\"price\">$48.00</span>",
                    "max_regular_price": "<span class=\"price\">$48.00</span>",
                    "minimal_regular_price": null,
                    "special_price": "<span class=\"price\">$48.00</span>",
                    "regular_price": "<span class=\"price\">$48.00</span>"
                  }
                },
                "weee_attributes": [],
                "weee_adjustment": "<span class=\"price\">$59.04</span>"
              }
            },
            "url": "http://demo-magento2.vuestorefront.io/aeon-capri.html",
            "id": 1866,
            "name": "Aeon Capri",
            "type": "configurable",
            "store_id": 1,
            "currency_code": "USD",
            "sgn": "bCt7e44sl1iZV8hzYGioKvSq0EdsAcF21FhpTG5t8l8"
          }
        ]
      }
    }
  */
  productApi.get('/list', (req, res) => {
    const productProxy = _getProxy(req)

    if (!req.query.skus) { return apiStatus(res, 'skus parameter is required', 400); }

    productProxy.list((req.query.skus as string).split(',')).then((result) => {
      apiStatus(res, result, 200);
    }).catch(err => {
      apiError(res, err);
    })
  })

  /**
   * GET get products info
   */
  /*
    #RESPONSE BODY:
    For list:

    {
      "code": 200,
      "result": {
        "items": [
          {
            "id": 1866,
            "sku": "WP07",
            "name": "Aeon Capri",
            "price": 0,
            "status": 1,
            "visibility": 4,
            "type_id": "configurable",
            "created_at": "2017-11-06 12:17:26",
            "updated_at": "2017-11-06 12:17:26",
            "product_links": [],
            "tier_prices": [],
            "custom_attributes": [
              {
                "attribute_code": "description",
                "value": "<p>Reach for the stars and beyond in these Aeon Capri pant. With a soft, comfortable feel and moisture wicking fabric, these duo-tone leggings are easy to wear -- and wear attractively.</p>\n<p>&bull; Black capris with teal accents.<br />&bull; Thick, 3\" flattering waistband.<br />&bull; Media pocket on inner waistband.<br />&bull; Dry wick finish for ultimate comfort and dryness.</p>"
              },
              {
                "attribute_code": "image",
                "value": "/w/p/wp07-black_main.jpg"
              },
              {
                "attribute_code": "category_ids",
                "value": [
                  "27",
                  "32",
                  "35",
                  "2"
                ]
              },
              {
                "attribute_code": "url_key",
                "value": "aeon-capri"
              },
              {
                "attribute_code": "tax_class_id",
                "value": "2"
              },
              {
                "attribute_code": "eco_collection",
                "value": "0"
              },
              {
                "attribute_code": "performance_fabric",
                "value": "1"
              },
              {
                "attribute_code": "erin_recommends",
                "value": "0"
              },
              {
                "attribute_code": "new",
                "value": "0"
              },
              {
                "attribute_code": "sale",
                "value": "0"
              },
              {
                "attribute_code": "style_bottom",
                "value": "107"
              },
              {
                "attribute_code": "pattern",
                "value": "195"
              },
              {
                "attribute_code": "climate",
                "value": "205,212,206"
              }
            ]
          }
        ],
        "search_criteria": {
          "filter_groups": [
            {
              "filters": [
                {
                  "field": "sku",
                  "value": "WP07",
                  "condition_type": "in"
                }
              ]
            }
          ]
        },
        "total_count": 1
      }
    }
    For render-list:

    {
      "code": 200,
      "result": {
        "items": [
          {
            "price_info": {
              "final_price": 59.04,
              "max_price": 59.04,
              "max_regular_price": 59.04,
              "minimal_regular_price": 59.04,
              "special_price": null,
              "minimal_price": 59.04,
              "regular_price": 48,
              "formatted_prices": {
                "final_price": "<span class=\"price\">$59.04</span>",
                "max_price": "<span class=\"price\">$59.04</span>",
                "minimal_price": "<span class=\"price\">$59.04</span>",
                "max_regular_price": "<span class=\"price\">$59.04</span>",
                "minimal_regular_price": null,
                "special_price": null,
                "regular_price": "<span class=\"price\">$48.00</span>"
              },
              "extension_attributes": {
                "tax_adjustments": {
                  "final_price": 47.999999,
                  "max_price": 47.999999,
                  "max_regular_price": 47.999999,
                  "minimal_regular_price": 47.999999,
                  "special_price": 47.999999,
                  "minimal_price": 47.999999,
                  "regular_price": 48,
                  "formatted_prices": {
                    "final_price": "<span class=\"price\">$48.00</span>",
                    "max_price": "<span class=\"price\">$48.00</span>",
                    "minimal_price": "<span class=\"price\">$48.00</span>",
                    "max_regular_price": "<span class=\"price\">$48.00</span>",
                    "minimal_regular_price": null,
                    "special_price": "<span class=\"price\">$48.00</span>",
                    "regular_price": "<span class=\"price\">$48.00</span>"
                  }
                },
                "weee_attributes": [],
                "weee_adjustment": "<span class=\"price\">$59.04</span>"
              }
            },
            "url": "http://demo-magento2.vuestorefront.io/aeon-capri.html",
            "id": 1866,
            "name": "Aeon Capri",
            "type": "configurable",
            "store_id": 1,
            "currency_code": "USD",
            "sgn": "bCt7e44sl1iZV8hzYGioKvSq0EdsAcF21FhpTG5t8l8"
          }
        ]
      }
    }
  */
  productApi.get('/render-list', (req, res) => {
    const productProxy = _getProxy(req)

    if (!req.query.skus) { return apiStatus(res, 'skus parameter is required', 400); }

    productProxy.renderList((req.query.skus as string).split(','), req.query.currencyCode, ((req.query.storeId as string) && parseInt((req.query.storeId as string)) > 0) ? Number(req.query.storeId) : 1).then((result) => {
      result.items = result.items.map((item) => {
        let sgnObj = item
        if (config.tax.calculateServerSide === true) {
          sgnObj = { priceInclTax: item.price_info.final_price }
        } else {
          sgnObj = { price: item.price_info.extension_attributes.tax_adjustments.final_price }
        }

        item.sgn = hmac.sign(sgnSrc(sgnObj, item), config.objHashSecret); // for products we sign off only price and id becase only such data is getting back with orders
        return item
      })
      apiStatus(res, result, 200);
    }).catch(err => {
      apiError(res, err);
    })
  })

  return productApi
}
