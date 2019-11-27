Storefront GraphQL API
======================

Storefront GraphQL API. Easy to use. Extendable. Blazing fast. ElasticSearch included.
Works great with Magento1, Magento2, Spree, OpenCart, Pimcore out of the box. [Easy to integrate with custom backends](https://github.com/DivanteLtd/storefront-integration-sdk).

## Requirements

- Docker and Docker Compose

Already included in `vue-storefront-api` Docker image (required locally, if you do not use containerization):
- Node.js 10.x or higher
- Yarn

## How to get started?

Storefront GraphQL comes with the default product schema - compatible with [Vue Storefront](https://github.com/DivanteLtd/vue-storefront) project and can be a drop-in replacement of `vue-storefront-api`.

## Elastic 5.6

To run the `storefront-graphql-api` in the `development` mode with ElasticSearch 5.6 please run:

`docker-compose up`

Then, to restore the demo data set please run:

`docker exec -it sga_app_1 yarn restore`

## Elastic 7.2

To run the `storefront-graphql-api` in the `development` mode with ElasticSearch 7.2 please do:

Change the config file (`config.elasticsearch.apiVersion`):

`echo '{ "elasticsearch": { "apiVersion": "7.2" } }' > config/local.json`

Then start the docker container:
`docker-compose -f docker-compose.elastic7.yml up `

Restore the demo data set:
`docker exec -it sga_app_1 yarn restore7`

## GraphQL Access

After the successfull installation you can start playing with GraphQL queries using your local GraphQL Playground which is exposed under: [http://localhost:8080/graphql](http://localhost:8080/graphql)

## REST API Access
Catalog API calls are compliant with ElasticSearch (it works like a filtering proxy to ES). More on ES queries: [ElasticSearch queries tutorial](http://okfnlabs.org/blog/2013/07/01/elasticsearch-query-tutorial.html)

Elastic search endpoint: `http://localhost:8080/api/catalog/search/<INDEX_NAME>/`. You can run the following command to check if everything is up and runing (it assumes `vue_storefront_catalog` as default index name):

`curl -i http://elastic:changeme@localhost:8080/api/catalog/vue_storefront_catalog/_search`

## Data formats

The data formats can be easily modified up to your needs by modifying the `src/graphql/elasticsearch/**` schemas and resolvers.
Check our [GraphQL Schema documentation](https://divanteltd.github.io/storefront-graphql-api-schema/) for the details regarding data formats.

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
