# Integration Tutorial

**Note:** This integration tutorial will guide you through custom backend integration with Storefront API. We're using the default data schema as provided by the  `default-catalog` [module](../modules/introduction.md). A second default module - `default-vsf` - is in charge of dynamic API calls (see below). This data format is compatible with [Vue Storefront](https://github.com/DivanteLtd/vue-storefront). Please don't worry about some notes specific to how Vue Storefront works (in regards to prices and taxes). I left them in as it's easier to understand the business logic given a real example of how the data is being consumed.

The `default-catalog` and `default-vsf` modules are platform-agnostic thanks to the [dedicated API connectors](https://github.com/DivanteLtd/vue-storefront#integrations) for eCommerce backend platforms. The data format in `storefront-API` is always the same for any platform, which means no matter what eCommerce backend you use, your frontend remains the same without any change.

It's a pretty useful strategy for migrations since you can easily migrate from one platform to another (or one version to another, e.g. Magento 1 to 2) without touching your frontend.

The integration works in two phases:

- **data pump** pulls static data (catalog, orders, etc.) from your eCommerce platform to Storefront API Elasticsearch and changes its format to our [data schema](https://divanteltd.github.io/storefront-graphql-api-schema/). Once finished pulling the data, you can query the product catalog. After pumping the data into Elasticsearch is done, it will stay in sync with changes made on the backend platform and update its content accordingly.

- **dynamic calls API** - This is a set of REST API modules: user, cart, review, etc. The dynamic API endpoints are located in the `src/api` folder and can be extended using custom extensions. The default API endpoints make use of the `PlatformFactory` which calls the platform-specific API clients defined under `src/platform`. Platform drivers run like a Proxy to the real eCommerce backend. [Check the API specification](../general/api.md)

Some of the most popular backend platforms already have integrations ([Magento 2](https://github.com/DivanteLtd/mage2vuestorefront), [Magento 1](https://github.com/DivanteLtd/magento1-vsbridge), [CoreShop](https://github.com/DivanteLtd/coreshop-vsbridge), [BigCommerce](https://github.com/DivanteLtd/bigcommerce2vuestorefront), [WooCommerce](https://github.com/DivanteLtd/woocommerce2vuestorefront)), but you can easily make your own with the `integration sdk` and the `src/modules/sample-api` modules.

The Storefront API ancestor is the [Vue Storefront API](https://github.com/DivanteLtd/vue-storefront-api). The integration strategy for both these projects is pretty similar. The original integration tutorial [has been posted here](https://github.com/DivanteLtd/storefront-integration-sdk/edit/tutorial/README.md).

First, we need to pull the products and categories data into Elastic Search.

## Two steps for the integration

- **Step One** Storefront API uses Elastic Search as a backend for all catalog operations. We have **three** default types of entities that must be supported: `product`, `category`, `attribute`, and **three optional entities**: `taxrule`, `cms_block` and `cms_page` in ES. You may find some sample-data json [files in the `sample-data` subdirectory](https://github.com/DivanteLtd/storefront-api/tree/develop/integration-sdk/sample-data).

- **Step Two** The second step is to support the **dynamic calls** that are used to synchronize shopping carts, promotion rules, user accounts, and so on. To accomplishe this, you'll need to implement all the basic API requests that are exposed in `src/api`: `user`, `cart`, `img`, `order`, `product`, `review`, `stock`. Actually, you might want to create just another `Platform driver` like we did for [`magento1`](https://github.com/DivanteLtd/storefront-api/tree/develop/src/platform/magento1) and [`magento2`](https://github.com/DivanteLtd/storefront-api/tree/develop/src/platform/magento2). <a href="#api-drivers">Read more on dynamic api calls</a>

## Tutorial

Now we are agoing to go through all three steps to integrate Storefront API with a custom or third party eCommerce platform.

First, make sure you've got [storefront-api installed](../general/installation.md) on your local machine, up and running. Opening [http://localhost:8080](http://localhost:8080) should display the default Storefront API GraphQL playground and you should be able to query some products and categories.

**Note:** As we'll be using Elastic Search extensively for the next steps in this tutorial, make sure you've got the right tooling to browse the ES indexes. I'm using [es-head](https://chrome.google.com/webstore/detail/elasticsearch-head/ffmkiejjmecolpfloofpjologoblkegm). It is pretty easy to use and a simple tool, provided as a Google Chrome plugin.

### **Empty the `vue_storefront_catalog` index**.  
This is the default Storefront API index which is the default index used by [`vue-storefront`](https://github.com/DivanteLtd/vue-storefront) - set up in the `config/local.json`, `elasticsearch.indices` section. We'll be using "default".

First, please go to the `storefront-api` directory with the following command:

```bash
$ cd ./storefront-api
```

Then you can empty the default index:

```bash
$ yarn db new
yarn run v1.17.3
$ node scripts/db.js new
Elasticsearch INFO: 2019-09-06T19:32:23Z
  Adding iconnection to http://localhost:9200/

** Hello! I am going to create s cNEW ES index
Elasticsearch DEBUG: 2019-09-06T19:32:23Z
  starting request {
    "method": "DELETE",
    "path": "/*/_alias/vue_storefront_catalog",
    "query": {}
  }
  
...
```

**Note:** Please make sure your local Elastic instance is up and running. After you've got `storefront-api` installed, you can check just by running `docker-compose up -d` in the `storefront-api` directory.

### **Import data**.
In your custom integration, you'll probably be pumping the data directly to ElasticSearch as it is changed in the platform admin panel.

This is exactly how standard integrations work. 

You might want to get inspired by:
- [`magento2-vsbridge-indexer`](https://github.com/DivanteLtd/magento2-vsbridge-indexer) - the PHP based integration for Magento2
- [`shopware2vuestorefront`](https://github.com/DivanteLtd/shopware2vuestorefront/tree/master/vsf-shopware-indexer) - which uses a NodeJS app to pull the data from the Shopware API and push it to Elastic
- [`spree2vuestorefront`](https://github.com/spark-solutions/spree2vuestorefront/) - which is putting thte data to Elastic directly from Ruby code, from Spree Commerce database
- [See other integrations ...](https://github.com/frqnck/awesome-vue-storefront#github-repos)

In our example, we'll push the static JSON files from `integration-sdk/sample-data` directly to the ElasticSearch index. Then I'll explain these data formats in detail to let you prepare such an automatic exporter on your own.

To push the data into ElasticSearch, we'll be using a simple NodeJS tool [located in the sample-data folder](https://github.com/DivanteLtd/storefront-api/tree/develop/integration-sdk/sample-data).

Now we can import the data:

```bash
$ cd ./storefront-api/integration-sdk/sample-data/
$ node import.js products.json product vue_storefront_catalog
Importing product { id: 1769,
  name: 'Chloe Compete Tank',
  image: '/w/t/wt06-blue_main.jpg',
  sku: 'WT06',
  url_key: 'chloe-compete-tank',
  url_path:
   'women/tops-women/tanks-women/bras-and-tanks-26/chloe-compete-tank-1769.html',
  type_id: 'configurable',
  price: 39,
  special_price: 0,
  price_incl_tax: null,
  special_price_incl_tax: null,
  special_to_date: null,
  special_from_date: null,
  status: 1,
  size: null,
  color: null,
  size_options: [ 167, 168, 169, 170, 171 ],
  color_options: [ 50, 58, 60 ],
  category_ids: [ '26' ],
  media_gallery:
  ...
{ _index: 'vue_storefront_catalog',
  _type: 'product',
  _id: '1433',
  _version: 2,
  result: 'updated',
  _shards: { total: 2, successful: 1, failed: 0 },
  created: false }
{ _index: 'vue_storefront_catalog',
  _type: 'product',
  _id: '1529',
  _version: 2,
  result: 'updated',
  _shards: { total: 2, successful: 1, failed: 0 },
  created: false }
```

Then please execute the same import scripts for the `atttribute` and `category` entities:

```bash
$ node import.js attributes.json attribute vue_storefront_catalog
$ node import.js categories.json category vue_storefront_catalog
```

After importing the data, we need to make sure the Storefront API Elastic index schema has been properly applied. To ensure this, we'll use the [Database tool](./database-tools.md) used previously to clear out the index once again:

```bash
$ docker exec -it sfa_app_1 yarn db rebuild7
yarn run v1.17.3
$ node scripts/db.js rebuild7
Elasticsearch INFO: 2019-09-06T20:13:28Z
  Adding connection to http://localhost:9200/

** Hello! I am going to rebuild EXISTING ES index to fix the schema
** Creating temporary index vue_storefront_catalog_1567800809
Elasticsearch DEBUG: 2019-09-06T20:13:28Z
  starting request {
    "method": "DELETE",
    "path": "/*/_alias/vue_storefront_catalog_1567800809",
    "query": {}
  }
```

**Congratulations!** Now it's a good moment to take a deep breath and study the data formats we've just imported to create your own mapper from the custom platform of your choice to the Storefront API format.

### Product entity

You might have seen that our data formats are pretty similar to Magento formats. We've simplified them and aggregated. **Some parts are denormalized** on purpose. We're trying to avoid the relations known from standard databases and rather use the [DTO](https://en.wikipedia.org/wiki/Data_transfer_object) concept. For example, Product is a DTO containing all information necessary to display the PDP (Product Details Page): including `media_gallery`, `configurable_children` and other features. It's then fairly easy to cache the data for Offline mode and performance improvements.

[Read the full Product entity specification](./format-product.md)

### Attribute entity

Storefront API uses the attributes meta data dictionaries saved in the `attribute` entities. They're related to the `product`. The `attribute.attribute_code` represents the `product[attribute_code]` property - when defined. When not, the `product[attribute_code]` is used as plain text.

[Read more on why Attributes are important](./format-attribute.md)

### Category entity

Categories are used mostly for building tree navigation. Vue Storefront uses [dynamic-catetgories-prefetching](https://docs.vuestorefront.io/guide/basics/configuration.html#dynamic-categories-prefetching). Please make sure that **all the categories** are indexed on the main level - even if they exist as a `category.children_data` assigned to any other category.

[Read the Category format specification](./format-category.md)


### TaxRate entity

**Note:** TaxRates are left out from `sample-data` as they're not crucial to display the products and categories in Vue Storefront (as long as the taxes are calculated before product pricing is imported to Elastic)

Here is the data format:

```json
{
  "id": 2,
  "code": "Poland",
  "priority": 0,
  "position": 0,
  "customer_tax_class_ids": [3],
  "product_tax_class_ids": [2],
  "tax_rate_ids": [4],
  "calculate_subtotal": false,
  "rates": [
    {
      "id": 4,
      "tax_country_id": "PL",
      "tax_region_id": 0,
      "tax_postcode": "*",
      "rate": 23,
      "code": "VAT23%",
      "titles": []
    }
  ]
}
```

To read more on how tax rates are processed when `config.tax.calculateServerSide=false`, please read the [Prices how to](./prices-how-to.md) and then [study the taxCalc.ts](https://github.com/DivanteLtd/storefront-api/blob/develop/src/lib/taxcalc.js).


### Write your API adapter for dynamic requests

Storefront API doesn't store any user data, order or payment information. Whenever a product is added to the cart, or user authorization is performed, an API request is executed.

The default API implementation - `packages/default-vsf` - is compatible with Vue Storefront. You might want to implement the API using totally different formats by creating a [new module](../modules/introduction.md). However, if you'd like to change the internal data format and stay compatible with [Vue Storefront](https://vuestorefront.io) you can achieve it in two different ways.

### Use the `default-vsf` and modify the Platform Driver
If you'd rather use the default API implementation, it's still extendable by switching the `src/platfrom` drivers. You might want to implement a custom driver, by putting it into `src/platform/custom-plaform` which is compatible with (implementing) the `src/platform/abstract/*` interfaces. Then you can switch the current platform by modifying the `local.json` configuration file:

```json
 "platform": "custom-platform"
```

### Use the `sample-api` as a boilerplate
The other way to go is to create your own, custom API based on the provided boilerplate. Take a look at the `src/modules/sample-api` for a custom API boilerplate to provide REST endpoints compatible with our default `packages/default-vsf` implementation.



[Read more about the required API endpoints you must provide to have Vue Storefront synchronized](../default-modules/api.md)
