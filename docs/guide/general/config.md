## Configuration
Starting point of customization is `default.json` or its copy `local.json` where the platform seeks configuration values. 
:::tip NOTE
If you want to modify `default.json`, don't edit it directly but copy the whole file into `local.json` and start editing it in that file. Why it should be done that way is explained later at [Secret 3. Why use node-config?](#secret-3-why-use-node-config)
:::
We have 2 `local.json` files, one of which is for backend here, and we will look at [Secret 2](#secret-2-study-in-local-json-for-vue-storefront), the other for frontend . 

At [`vue-storefront-api/config/default.json`](https://github.com/DivanteLtd/storefront-api/blob/develop/config/default.json) for **backend** : 
```json
  "server": {
    "host": "localhost",
    "port": 8080,
    "searchEngine": "elasticsearch"
  },  
```
- This is where your API backend is defined. The server will listen `server.host`:`server.port` unless it's defined otherwise in environment variables. 

- `server.searchEngine` is used in the integration with `graphql` so please don't change it. [jump to code](https://github.com/DivanteLtd/vue-storefront-api/blob/develop/src/graphql/resolvers.js#L6)
```json
  "orders": {
    "useServerQueue": false
  },
  "catalog": {
    "excludeDisabledProducts": false
  },
```
- `orders.useServerQueue` allows you to use queue process when `order` API is used to create an order. [jump to code](https://github.com/DivanteLtd/storefront-api/blob/develop/src/api/order.js#L65)

- `catalog.excludeDisabledProducts` allows you to skip disabled products when importing products using `mage2vs`. 
[jump to code](https://github.com/DivanteLtd/mage2vuestorefront/blob/master/src/adapters/magento/product.js#L166)

```json
  "elasticsearch": {
    "host": "localhost",
    "port": 9200,
    "protocol": "http",
    "user": "elastic",
    "password": "changeme",
    "min_score": 0.01,
    "indices": [
      "vue_storefront_catalog",
      "vue_storefront_catalog_de",
      "vue_storefront_catalog_it"
    ],
    "indexTypes": [
      "product",
      "category",
      "cms",
      "attribute",
      "taxrule",
      "review"
    ],
    "apiVersion": "5.6"
  },
```
- `elasticsearch` element is used widely across the whole platform. Considering `elasticsearch` works as a data store (database), it's natural. 

  - `host`, `port`, `protocol` defines `elasticsearch` connect information. 
- `user`, `password` is default credentials of `elasticsearch`. If you changed the credentials of `elasticsearch`, please change this accordingly. [more info](https://www.elastic.co/guide/en/x-pack/current/security-getting-started.html)
  - `min_score` sets a `min_score` when building a query for `elasticsearch`. [jump to code](https://github.com/DivanteLtd/vue-storefront-api/blob/develop/src/graphql/elasticsearch/queryBuilder.js#L172)
    :::tip TIP
    `min_score` helps you exclude documents with `_score` less than `min_score` value. 
    :::
  - `indices` may contain one or multiple indexes. Each index acts as a data store for a storefront. You may add entries to the array with arbitrary names or remove entries from it. 
    :::warning CAUTION !
     However, the index name should match the one you will use for [data pump](data-import.md#_2-2-recipe-b-using-on-premise). 
     :::
  The default values for `indices` assume you have 2 additional stores(`de`, `it`) plus the default store.  
  - `indexTypes` contains values for mapping. You can consider it as `table` if you take `indices` as database.
  - `apiVersion` defines the `elasticsearch` version it uses. The default is 7.1.

```json
  "redis": {
    "host": "localhost",
    "port": 6379,
    "db": 0
  },
  "kue": {},
```
- `redis` contains `redis` server connect information.
- `kue` contains `kue` application options. [jump to code for options](https://github.com/Automattic/kue/blob/master/lib/kue.js#L88)

```json
  "availableStores": [
    "de",
    "it"
  ],
```
- `availableStores` contains additional stores code name. If this value is an empty array, it means you only have one default store. 

```json
"storeViews": {
    "multistore": true,
    "mapStoreUrlsFor": [
      "de",
      "it"
    ],
    "de": {
      "storeCode": "de",
      "disabled": true,
      "storeId": 3,
      "name": "German Store",
      "url": "/de",
      "elasticsearch": {
        "host": "localhost:8080/api/catalog",
        "index": "vue_storefront_catalog_de"
      },
      "tax": {
        "defaultCountry": "DE",
        "defaultRegion": "",
        "calculateServerSide": true,
      "sourcePriceIncludesTax": false
      },
      "i18n": {
        "fullCountryName": "Germany",
        "fullLanguageName": "German",
        "defaultLanguage": "DE",
        "defaultCountry": "DE",
        "defaultLocale": "de-DE",
        "currencyCode": "EUR",
        "currencySign": "EUR",
        "dateFormat": "HH:mm D-M-YYYY"
      }
    },
    "it": {
      "storeCode": "it",
      "disabled": true,
      "storeId": 4,
      "name": "Italian Store",
      "url": "/it",
      "elasticsearch": {
        "host": "localhost:8080/api/catalog",
        "index": "vue_storefront_catalog_it"
      },
      "tax": {
        "defaultCountry": "IT",
        "defaultRegion": "",
        "calculateServerSide": true,
        "sourcePriceIncludesTax": false
      },
      "i18n": {
        "fullCountryName": "Italy",
        "fullLanguageName": "Italian",
        "defaultCountry": "IT",
        "defaultLanguage": "IT",
        "defaultLocale": "it-IT",
        "currencyCode": "EUR",
        "currencySign": "EUR",
        "dateFormat": "HH:mm D-M-YYYY"
      }
    }
  },

```
- `storeViews` element contains the whole information of ***additional*** stores. The default store information doesn't exist here, it exists on top level.
- `multistore` is supposed to tell the platform if it has multiple stores to consider. For example, it is used to configure `tax` values of additional store. [jump to code](https://github.com/DivanteLtd/storefront-api/blob/develop/src/platform/magento2/tax.js#L14) 
- `mapStoreUrlsFor` is used for building url routes in frontend. [jump to code](https://github.com/DivanteLtd/storefront/blob/master/core/lib/multistore.ts#L85)
- `de` element contains detailed information of `de` store. You need to have this kind of element for all the additional stores you added to `availableStores` with `storeCode` as the key. `de` and `it` in the `default.json` exhibits an example you can copy & paste for other stores you need to add. 
  - `storeCode` denotes store code for the store. 
  - `disabled` means if this store is disabled. 
  - `storeId` denotes store ID of the store.
  - `name` denotes the store name.
  - `url` denotes URL for the store.
  - `elasticsearch` contains information for the store. This information may override the default one defined above. 
    - `host` is where your *Elasticsearch* listens on.
    - `index` is the name of the index for the store.
  - `tax` contains tax information of the store.
    - `defaultCountry` is the code name of the country on which tax is calculated for the store. 
    - `defaultRegion` is default region.
    - `calculateServerSide` determines if price is fetched with(`true`)/without(`false`) tax calculated. [jump to code](https://github.com/DivanteLtd/storefront-api/blob/develop/src/api/product.js#L48)
    - `sourcePriceIncludesTax` determines whether price is stored with tax applied (`true`) or tax calculated on runtime (`false`).  [jump to code](https://github.com/DivanteLtd/storefront-api/blob/develop/src/platform/magento2/tax.js#L12)
  - `i18n` connotes *internationalization*. [more info](https://en.wikipedia.org/wiki/Internationalization_and_localization)   
    - `fullCountryName` is the full name of the country this `i18n` is applied to.
    - `fullLanguageName` is the full name of the language this `i18n` is applied to.
    - `defaultCountry` is the abbreviated name of the country this `i18n` is applied to by default.
    - `defaultLanguage` is the abbreviated name of the language this `i18n` is applied to by default.
    - `defaultLocale` is the default locale this `i18n` uses. 
    - `currencyCode` is the currency code this store uses. 
    - `currencySign` is the currency sign this store uses. 
    - `dateFormat` is the date format this store uses. 
    
    
 ```json
  "authHashSecret": "__SECRET_CHANGE_ME__",
  "objHashSecret": "__SECRET_CHANGE_ME__",
 ```
- `authHashSecret` is used to encode & decode JWT for API use. 
- `objHashSecret` is 1) fallback secret hash for `authHashSecret`, 2) used for hashing in tax calculation. 

```json
  "cart": {
    "setConfigurableProductOptions": false
  },
  "tax": {
    "defaultCountry": "PL",
    "defaultRegion": "",
    "calculateServerSide": true,
    "alwaysSyncPlatformPricesOver": false,
    "usePlatformTotals": true,
    "setConfigurableProductOptions": true,
    "sourcePriceIncludesTax": false
  },
```
- `cart` 
  - `setConfigurableProductOptions` flag determines to show either the parent item or the child item (aka selected option item) in the cart context. `true` shows parent item instead of the option item selected.  [jump to code](https://github.com/DivanteLtd/storefront-api/blob/develop/src/platform/magento2/o2m.js#L94)
- `tax`
  - `alwaysSyncPlatformPricesOver`  [jump to code](https://github.com/DivanteLtd/storefront-api/blob/develop/src/api/order.js#L49)
  - `usePlatformTotals` 
  These two options are used to determine whether to fetch prices from data source on the fly or not. If you set `alwaysSyncPlatformPricesOver` true, then it skips checking the checksum for cart items based on price.  
  
```json
  "bodyLimit": "100kb",
  "corsHeaders": [
    "Link"
  ],
```
- `bodyLimit` limits how big a request can be for your application. 
- `corsHeaders` allows you to add entries to `Access-Control-Expose-Headers`

```json
  "platform": "magento2",
```
- `platform` defines which e-commerce platform is used as a source. [jump to code](https://github.com/DivanteLtd/storefront-api/blob/develop/src/api/order.js#L13)

```json
  "registeredExtensions": [
    "mailchimp-subscribe",
    "example-magento-api",
    "cms-data",
    "mail-service"
  ],
  "extensions": {
    "mailchimp": {
      "listId": "e06875a7e1",
      "apiKey": "a9a3318ea7d30f5c5596bd4a78ae0985-us3",
      "apiUrl": "https://us3.api.mailchimp.com/3.0"
    },
    "mailService": {
      "transport": {
        "host": "smtp.gmail.com",
        "port": 465,
        "secure": true,
        "user": "vuestorefront",
        "pass": "vuestorefront.io"
      },
      "targetAddressWhitelist": ["contributors@vuestorefront.io"],
      "secretString": "__THIS_IS_SO_SECRET__"
    }
  },
```
- `modules.defaultCatalog.registeredExtensions` element contains the list of supported extensions, it bootstraps entry points for those extensions [jump to code](https://github.com/DivanteLtd/storefront-api/blob/develop/src/api/index.js#L45)

- `extensions` contains additional configuration for extensions. [jump to code](https://github.com/DivanteLtd/storefront-api/tree/master/src/api/extensions)
  - `mailchimp` provides `POST`, `DELETE` APIs for *Mailchimp* `subscribe` method.
    - `listId` is the ID of list you are publishing.
    - `apiKey` is API key you are assigned.
    - `apiUrl` is API base url for *Mailchimp* service. 
  - `mailService`  is used to send emails from Storefront Api via *Gmail*.
    - `transport` contains basic information for *Gmail* service.
      - `host` is where your mail is sent en route.
      - `port` is the port number used for the service.
      - `secure` determines to use SSL connection. 
      - `user` is `username` for the service.
      - `pass` is `password` for the service.
    - `targetAddressWhitelist` checks if an user confirmed his/her email address *and* source email is white-listed. 
    - `secretString` is used for hashing. 

```json
  "magento2": {
    "url": "http://demo-magento2.vuestorefront.io/", 
    "imgUrl": "http://demo-magento2.vuestorefront.io/media/catalog/product", 
    "assetPath": "/../var/magento2-sample-data/pub/media", 
    "magentoUserName": "", 
    "magentoUserPassword": "", 
    "httpUserName": "", 
    "httpUserPassword": "", 
    "api": {
      "url": "http://demo-magento2.vuestorefront.io/rest",
      "consumerKey": "byv3730rhoulpopcq64don8ukb8lf2gq",
      "consumerSecret": "u9q4fcobv7vfx9td80oupa6uhexc27rb",
      "accessToken": "040xx3qy7s0j28o3q0exrfop579cy20m",
      "accessTokenSecret": "7qunl3p505rubmr7u1ijt7odyialnih9"
    }
  },
  "magento1": {
    "url": "http://magento-demo.local",
    "imgUrl": "http://magento-demo.local/media/catalog/product",
    "magentoUserName": "",
    "magentoUserPassword": "",
    "httpUserName": "",
    "httpUserPassword": "",
    "api": {
      "url": "http://magento-demo.local/vsbridge",
      "consumerKey": "",
      "consumerSecret": "",
      "accessToken": "",
      "accessTokenSecret": ""
    }
  },
```
- `magento2`  is used to integrate with Magento 2 as a data source. 
  
  - `imgUrl` is base image url. [jump to code](https://github.com/DivanteLtd/storefront-api/blob/develop/src/api/img.js#L38)
    
  - `assetPath` is used for the `media` path. [jump to code](https://github.com/DivanteLtd/vue-storefront-api/blob/develop/src/index.js#L22)
  
  - `api` contains API credentials for integration.
  
    - `url` is base url for Magento 2 instance.
    - `consumerKey` See **TIP**
    - `consumerSecret`
    - `accessToken`
    - `accessTokenSecret`
  
    
  
    :::tip TIP
  
    These 4 nodes above is the required credentials for integration with Magento 2. [how to get them](data-import.html#_2-2-recipe-b-using-on-premise)
  
    :::

`magento1` has just the same structure with `magento2`.



```json
  "imageable": {
    "namespace": "", 
    "maxListeners": 512,
    "imageSizeLimit": 1024,
    "whitelist": {
      "allowedHosts": [
        ".*divante.pl",
        ".*vuestorefront.io"
      ]
    },
    "cache": {
      "memory": 50,
      "files": 20,
      "items": 100
    },
    "concurrency": 0,
    "counters": {
      "queue": 2,
      "process": 4
    },
    "simd": true,
    "keepDownloads": true 
  },
```
- `imageable` deals with everything you need to configure when it comes to your storefront images, especially product images. 
  
  - `maxListeners` limits maximum listeners to request's socket. [jump to code](https://github.com/DivanteLtd/storefront-api/blob/develop/src/api/img.js#L21)
  - `imageSizeLimit`  limits maximum image size. [jump to code](https://github.com/DivanteLtd/storefront-api/blob/develop/src/api/img.js#L56)
  - `whitelist` contains a white-list of image source domains
    
    - `allowedHosts` contains the array of white-list
    
    :::warning DON'T FORGET
    
    You should include your source domain in `allowedHosts` or your request for product images will fail. [more info](data-import.html#secret-1-product-image-is-not-synced)
    
    :::
    
    :::tip NOTE
    
    From `cache` to `simd` they are used to configure [Sharp](https://github.com/lovell/sharp) library. *Sharp* is a popular library for image processing in *Node.js*. [jump to option docs](https://sharp.dimens.io/en/stable/api-utility/#cache) 
    
    :::
    
  - `cache` limits `libvips` operation cache from *Sharp*. Values hereunder are default values. [jump to code](https://github.com/DivanteLtd/storefront-api/blob/develop/src/lib/image.js#L5) 
  
    - `memory` is the maximum memory in MB to use for the cache. 
    - `files` is the maximum number of files to hold open. 
    - `items` is the maximum number of operations to cache. 
  
  - `concurrency`  is the number of threads for processing each image. 
  
  - `counters` provides access to internal task counters. 
  
    - `queue` is the number of tasks in queue for *libuv* to provide a worker thread. 
    - `process` limits the number of resize tasks concurrently processed. 
  
  - `simd` to use SIMD vector unit of the CPU in order to enhance the performance.  
  


```json
 "entities": {
    "category": {
        "includeFields": [ "children_data", "id", "children_count", "sku", "name", "is_active", "parent_id", "level", "url_key" ]
    },
    "attribute": {
      "includeFields": [ "attribute_code", "id", "entity_type_id", "options", "default_value", "is_user_defined", "frontend_label", "attribute_id", "default_frontend_label", "is_visible_on_front", "is_visible", "is_comparable" ]
    },
    "productList": {
      "sort": "",
      "includeFields": [ "type_id", "sku", "product_links", "tax_class_id", "special_price", "special_to_date", "special_from_date", "name", "price", "priceInclTax", "originalPriceInclTax", "originalPrice", "specialPriceInclTax", "id", "image", "sale", "new", "url_key" ],
      "excludeFields": [ "configurable_children", "description", "configurable_options", "sgn" ]
    },
    "productListWithChildren": {
      "includeFields": [ "type_id", "sku", "name", "tax_class_id", "special_price", "special_to_date", "special_from_date", "price", "priceInclTax", "originalPriceInclTax", "originalPrice", "specialPriceInclTax", "id", "image", "sale", "new", "configurable_children.image", "configurable_children.sku", "configurable_children.price", "configurable_children.special_price", "configurable_children.priceInclTax", "configurable_children.specialPriceInclTax", "configurable_children.originalPrice", "configurable_children.originalPriceInclTax", "configurable_children.color", "configurable_children.size", "product_links", "url_key"],
      "excludeFields": [ "description", "sgn"]
    },
    "product": {
      "excludeFields": [ "updated_at", "created_at", "attribute_set_id", "status", "visibility", "tier_prices", "options_container", "msrp_display_actual_price_type", "has_options", "stock.manage_stock", "stock.use_config_min_qty", "stock.use_config_notify_stock_qty", "stock.stock_id",  "stock.use_config_backorders", "stock.use_config_enable_qty_inc", "stock.enable_qty_increments", "stock.use_config_manage_stock", "stock.use_config_min_sale_qty", "stock.notify_stock_qty", "stock.use_config_max_sale_qty", "stock.use_config_max_sale_qty", "stock.qty_increments", "small_image"],
      "includeFields": null,
      "filterFieldMapping": {
        "category.name": "category.name.keyword"
      }
    }
  },
```
- `entities` is used to integrate with *GraphQL* in **Storefront API**.  
  - `category`
    - `includeFields` contains an array of fields to be added as `sourceInclude` [jump to code](https://github.com/DivanteLtd/storefront-api/blob/develop/src/graphql/elasticsearch/category/resolver.js#L10)
  - `product`
    - `filterFieldMapping` adds a field mapping to apply a filter in a query [jump to code](https://github.com/DivanteLtd/storefront-api/blob/develop/src/graphql/elasticsearch/mapping.js#L19)
      - `category.name` 
      
```json
  "usePriceTiers": false,
  "boost": {
    "name": 3,
    "category.name": 1,
    "short_description": 1,
    "description": 1,
    "sku": 1,
    "configurable_children.sku": 1
  }
```
- `usePriceTiers` determines whether to use price tiers for customers in groups
- `boost` is used to give weighted values to fields for a query to *Elasticsearch*, the bigger, the heavier. 
  - `name` field has the value *3* so that matching query with the `name` has the highest priority.
  - `category.name` ,`short_description`, `description`, `sku`, `configurable_children.sku ` the rest of fields have the default value; 1. 
  
