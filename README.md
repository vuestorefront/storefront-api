Storefront API
==============

Storefront GraphQL API. Easy to use. Extendable. Blazing fast. ElasticSearch included. [BFF (Backend for frontend)](https://samnewman.io/patterns/architectural/bff/) driven.
Works great with Magento1, Magento2, Spree, OpenCart, Pimcore out of the box. [Easy to integrate with custom backends](https://github.com/DivanteLtd/storefront-integration-sdk).

You can use **Storefront GraphQL API** to integrate **all your backend systems** under single GraphQL/REST API with your eCommerce frontend.
By default all the catalog information are stored in ElasticSearch and all the write operations are being forwarded to the **platform driver** (Magento1, Magento2, Spree and others avaialble),

## Example use cases

 - **Headless eCommerce data source** for any React/Vue/Angular frontend connected to Magento or any other supported eCommerce platform,
 - **GraphQL Gateway** taking the data from **existing REST API and mixing** with ElasticSearch or Database data,
 - **Custom GraphQL schema** - optimized for your backend platform,
 - **Custom eCommerce Backend** - by just implementing the custom Cart, User, Stock .. modules and re-using the Catalog service.

<img src="https://divante.com/github/storefront-api/graphql-playground.png" alt="GraphQL Playground is included"/>
<em style="text-align:center;">This is a screen showing the GraphQL Playground on storefront-api schema. <a href="https://divanteltd.github.io/storefront-api-schema/">Check the schema docs</a>. It can be 100% customized.</em>

## Key features

 - Fully functional and extendbable eCommerce API Gateway,
 - Read/Write integrations with [Magento1](https://github.com/DivanteLtd/magento1-vsbridge-indexer), [EpiServer](https://github.com/makingwaves/epi-commerce-to-vue-storefront), [Magento2](https://github.com/DivanteLtd/magento2-vsbridge-indexer), [OpenCart](https://github.com/butopea/vue-storefront-opencart-vsbridge), [SpreeCommerce](https://github.com/spark-solutions/spree2vuestorefront),
 - Additional integrations including [Prismic](https://forum.vuestorefront.io/t/prismic-connector/160) with GraphQL support,
 - [Vue Storefront](https://vuestorefront.io) PWA frontend support,
 - Blazing Fast - based on ElasticSearch with avg. response times < 100ms,
 - GraphQL API with 100% Customizable [GraphQL schema](https://divanteltd.github.io/storefront-api-schema/),
 - REST API with [ElasticSearch DSL support](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl.html),
 - Catalog, Cart, User, Stock, Review, Order, Image resizer modules available thru REST API,
 - Multistore support based on store-views (aka. sales channels) concept,
 - Dynamic tax calculation engine,
 - Extendable via custom extensions (including GraphQL schema and resolver extensions),
 - ElasticSearch maintenance tools - dump/restore/schema maintenance/migrations,
 - Custom eCommerce Backend integrations via [integration sdk](https://github.com/DivanteLtd/storefront-integration-sdk).
 
## Requirements

- Docker and Docker Compose

Already included in `storefront-api` Docker image (required locally, if you do not use containerization):
- Node.js 10.x or higher
- Yarn

## How to get started?

Storefront API comes with the default product schema - compatible with [Vue Storefront](https://github.com/DivanteLtd/vue-storefront) project and can be a drop-in replacement of `vue-storefront-api`. You can easily start the dev instance including the demo data set integrated with [Magento 2.3 demo instance](http://demo-magento2.vuestorefront.io).

### Elastic 5.6

To run the `storefront-api` in the `development` mode with ElasticSearch 5.6 please run:

`docker-compose up`

Then, to restore the demo data set please run:

`docker exec -it sfa_app_1 yarn restore`

### Elastic 7.2

To run the `storefront-api` in the `development` mode with ElasticSearch 7.2 please do:

Change the config file (`config.elasticsearch.apiVersion`):

`echo '{ "elasticsearch": { "apiVersion": "7.2" } }' > config/local.json`

Then start the docker container:
`docker-compose -f docker-compose.elastic7.yml up `

Restore the demo data set:
`docker exec -it sfa_app_1 yarn restore7`

## GraphQL Access

After the successfull installation you can start playing with GraphQL queries using your local GraphQL Playground which is exposed under: [http://localhost:8080/graphql](http://localhost:8080/graphql)

## REST Access
Catalog API calls are compliant with ElasticSearch (it works like a filtering proxy to ES). More on ES queries: [ElasticSearch queries tutorial](http://okfnlabs.org/blog/2013/07/01/elasticsearch-query-tutorial.html)

Elastic search endpoint: `http://localhost:8080/api/catalog/search/<INDEX_NAME>/`. You can run the following command to check if everything is up and runing (it assumes `vue_storefront_catalog` as default index name):

`curl -i http://elastic:changeme@localhost:8080/api/catalog/vue_storefront_catalog/_search`

## Data formats

The data formats can be easily modified up to your needs by modifying the `src/graphql/elasticsearch/**` schemas and resolvers.
Check our [GraphQL Schema documentation](https://divanteltd.github.io/storefront-api-schema/) for the details regarding data formats.

## Adding custom modules with own dependencies (Yarn only)
When adding custom [Extensions to the API](https://github.com/DivanteLtd/vue-storefront/blob/master/doc/Extending%20vue-storefront-api.md) you might want to define some dependencies inside them. Thanks to [Yarn workspaces](https://yarnpkg.com/lang/en/docs/workspaces/) dependencies defined inside your custom module will be installed when you execute `yarn` at project root level, so it's way easier and faster than installing all modules dependencies separately.

To do this, define the `package.json` with your dependencies in your custom module:
- `src/api/extensions/{your-custom-extension}/package.json` 
- `src/platforms/{your-custom-platform}/package.json`

NOTE: `npm` users will still have to install the dependencies individually in their modules.

## Self signed certificates

Often in non production environment other services are using self signed certificates for secure connection.
You can easily setup the application to trust them by putting them in config/certs directory.  

License
-------

[MIT](./LICENSE)
