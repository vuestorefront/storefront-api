# Introduction

Storefront API is a customizable, modular eCommerce API gateway. You can use this product to provide all your frontends - including mobile applications - with a single data source. **GraphQL support** lets you easily implement the BFF ([Backend for Frontend](https://samnewman.io/patterns/architectural/bff/)) pattern. It unifies the interfaces between all the systems backing your frontend, and lets you query multiple data sources with a single HTTP request.

Storefront API is **backend agnostic**. That means it's not an eCommerce backend itself. Out of the box it's provided with Read/Write integrations with [Magento1](https://github.com/DivanteLtd/magento1-vsbridge-indexer), [EpiServer](https://github.com/makingwaves/epi-commerce-to-vue-storefront), [Magento2](https://github.com/DivanteLtd/magento2-vsbridge-indexer), [OpenCart](https://github.com/butopea/vue-storefront-opencart-vsbridge), and [SpreeCommerce](https://github.com/spark-solutions/spree2vuestorefront)

The architecture is modular. Out of the box, we provide a set of modules (`default-catalog`, `default-vsf`, `default-img`) implementing our agnostic eCommerce data formats.  By default, all the catalog information is stored in ElasticSearch (read operations). The write operations are forwarded to **dedicated API drivers** (Magento1, Magento2, Spree, and others available).

<img src="https://divante.com/github/storefront-api/graphql-playground.png" alt="GraphQL Playground is included"/>
<em style="text-align:center;">This is a screen showing the GraphQL Playground on storefront-api schema. <a href="https://divanteltd.github.io/storefront-graphql-api-schema/">Check the schema docs</a>. It can be 100% customized.</em>

## Key features

 - Fully functional and extendbable eCommerce API Gateway,
 - Read/Write integrations with [Magento1](https://github.com/DivanteLtd/magento1-vsbridge-indexer), [EpiServer](https://github.com/makingwaves/epi-commerce-to-vue-storefront), [Magento2](https://github.com/DivanteLtd/magento2-vsbridge-indexer), [OpenCart](https://github.com/butopea/vue-storefront-opencart-vsbridge), and [SpreeCommerce](https://github.com/spark-solutions/spree2vuestorefront),
 - Additional integrations including [Prismic](https://forum.vuestorefront.io/t/prismic-connector/160) with GraphQL support,
 - [Vue Storefront](https://vuestorefront.io) PWA frontend support,
 - Blazingly Fast - based on ElasticSearch with an average response time < 100ms,
 - GraphQL API with 100% Customizable [GraphQL schema](https://divanteltd.github.io/storefront-graphql-api-schema/),
 - REST API with [ElasticSearch DSL support](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl.html),
 - Catalog, Cart, User, Stock, Review, Order, and Image resizer modules available through the REST API,
 - Multistore support based on the store-views (aka. sales channels) concept,
 - Dynamic tax calculation engine,
 - Extendable via custom extensions (including GraphQL schema and resolver extensions),
 - ElasticSearch maintenance tools - dump/restore/schema maintenance/migrations,
 - Custom eCommerce Backend integrations via [integration sdk](https://sfa-docs.now.sh/guide/integration/integration.html#two-steps-for-the-integration).


## Modules

Storefront API provides all features, GraphQL schemas, ElasticSearch resolvers and API handlers via [Modules](../modules/introduction.md). That's it. The default schema and the features described in the later parts of the documentation have been implemented by the `default-catalog`, `default-img` and `default-vsf` modules. You can customize, clone or disable them.

Each module presents its own:
- GraphQL schema and resolvers,
- ElasticSearch mappings,
- API methods - via express.js handlers and middlewares.

[Read more about Storefront API modules](../modules/introduction.md)
[Read more about The Default modules](../default-modules/introduction.md)

<img src="https://divante.com//github/storefront-api/storefront-api-architecture.png" alt="Storefront API architecture" />

## How does it connect with backend platforms?
This product manages to be platform-agnostic thanks to [dedicated API connectors](https://github.com/DivanteLtd/vue-storefront#integrations) for eCommerce backend platforms. The data format in `storefront-api` is always the same for any platform, which means no matter which eCommerce backend you use, your frontend remains the same without any change.

This means you can easily migrate from one platform to another (or one version to another, e.g. Magento 1 to 2) without touching your frontend.

The API connector, by default, works in two phases:

- The **data pump** pulls static data (catalog, orders, etc.) from your eCommerce platform to Storefront API Elasticsearch and changes its format to our [data schema](https://divanteltd.github.io/storefront-graphql-api-schema/). Once it is finished pulling the data, you can query the product catalog. After pumping the data into Elasticsearch is done, it will stay in sync with changes made on the backend platform and update its content accordingly.

- The **dynamic calls API** is a set of REST API modules: user, cart, review, etc. The dynamic API endpoints are located in the `src/api` folder and can be extended by custom extensions. The default API endpoints make use of the `PlatformFactory` which calls the platform-specific API clients defined under `src/platform`. Platform drivers work like a Proxy to the real eCommerce backend. [Check the API specification](../default-modules/api.md)

Some of the most popular backend platforms already have working integrations ([Magento 2](https://github.com/DivanteLtd/mage2vuestorefront), [Magento 1](https://github.com/DivanteLtd/magento1-vsbridge), [CoreShop](https://github.com/DivanteLtd/coreshop-vsbridge), [BigCommerce](https://github.com/DivanteLtd/bigcommerce2vuestorefront), [WooCommerce](https://github.com/DivanteLtd/woocommerce2vuestorefront)), but you can easily make your own with the [integration sdk](https://sfa-docs.now.sh/guide/integration/integration.html#two-steps-for-the-integration).

[Read the integration tutorial](../integration/integration.md)

## Storefront API config file

Most of the Storefront configuration (like the active theme, backend API addresses, multistore setup, etc.) is done through its [config](./config.md) file which can be found under the `config` folder. The `default.json` file contains all the default setup information.

For your implementation, you should create a `local.json` file in the same directory and include the fields from `default.json` that you want to override. These two files will be merged in favor of `local.json` during the build process.

[Read more on configs](./config.md)

## What else
You may not believe me, but this is all you need to know to start working with Storefront API! Once you are done wrapping your head around the basics, look around the docs and visit our community [slack](https://slack.vuestorefront.io) to dig deeper into the project.

