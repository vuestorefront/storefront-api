# Storefront API Modules

We designed the Storefront API (`SFAPI`) upon fully modular architecture. We composed the modules engine with the Inversion of Control principle. In this particular case it means that each module has full control over core `SFAPI` features, including:

- GraphQL schema,
- GraphQL middlewares,
- ElasticSearch schema,
- REST API Endpoints,
- REST API Middlewares.

## Default modules

The default API implementation - `src/modules/default-vsf` is compatible with Vue Storefront. You might want to implement the API in with totally different formats creating a [new module](../modules/tutorial.md) based on one of the default modules or the boilerplates: [`template-module`](https://github.com/DivanteLtd/storefront-api/tree/develop/src/modules/template-module) and [`sample-api`](https://github.com/DivanteLtd/storefront-api/tree/develop/src/modules/sample-api)

### default-catalog module

This module is in charge of providing the standard [GraphQL Schema]() and ElasticSearch entities. This module is for providing the Vue Storefront compatibility - including integrations with Magento1, Magento2, Spree and other platforms. You might want to use this module to implement [custom backend integration](../integration/integration.md). If your backend platform uses different data formats, it might be easier to  comment out the default module from [modules entry point](https://github.com/DivanteLtd/storefront-api/blob/develop/src/modules/index.ts) and create a new one.

### default-vsf module

This module implements a REST API covering most of the operations eCommerce can have - including `user`, `cart`, `order`, `review` and other modules. The cool part is that it's compatible with Vue Storefront and most of the existing integrations we have for it. If you'd like to integrate this API with your custom backend, you might want to follow the [custom backend integration tutorial](../integration/integration.md). This module uses a [`platform`](https://github.com/DivanteLtd/storefront-api/tree/develop/src/platform) drivers. You may want to implement your custom driver. The other way around is to disable `default-vsf` module and create a new API from scratch, using the [`simple-api`](https://github.com/DivanteLtd/storefront-api/tree/develop/src/modules/sample-api).

## default-img module

The image resizer which is compatible with Vue Storefront and `default-catalog` module and the [platform concept](../default-modules/platforms.md). It takes the `baseUrl` from the `config[config.platform]` section by default and based on that generates the thumbnail or crops the picture.


## Where can I find my modules?

Modules are located in [`src/modules`](https://github.com/DivanteLtd/storefront-api/tree/develop/src/modules) however, you can easily load `npm` based modules just by [referencing them in modules entry point](https://github.com/DivanteLtd/storefront-api/blob/develop/src/modules/index.ts). The same way you can disable the default e-Commerce modules that are provided within the `default-catalog`, `default-vsf` and `default-img` folders.


## How module interface looks like?

The interfaces must be referenced prior to use in the [`src/modules/index.ts`](https://github.com/DivanteLtd/storefront-api/blob/develop/src/modules/index.ts) entrypoint:

```js
import { DefaultVuestorefrontApiModule } from './default-vsf'
import { DefaultCatalogModule } from './default-catalog'

export default [
  DefaultVuestorefrontApiModule,
  DefaultCatalogModule,
  ...
]
```

Each module file is returning the [`StorefrontApiModule`](https://github.com/DivanteLtd/storefront-api/blob/a66222768bf7fb5f54acf268b6a0bb4e0f94a4cf/src/lib/module/types.ts#L24) structure:


```js
export const TemplateModule: StorefrontApiModule = new StorefrontApiModule({
  key: 'template-module',

  /** Return the GraphQL schema and resolvers */
  initGraphql: ({ config, db, app }: StorefrontApiContext): GraphqlConfiguration => {
    return {
      resolvers,
      schema,
      hasGraphqlSupport: true
    }
  },

  /** Return ElasticSearch mappings - you might extend existing entities (deepMerge will be executed on the types) */
  loadMappings: ({ config, db, app }: StorefrontApiContext): ElasticSearchMappings => {
    return {
      schemas: {
        'custom': loadSchema(path.join(__dirname, 'elasticsearch'), 'custom', config.get('elasticsearch.apiVersion'))
      }}
  },

  /** Here you can just extend the default Express.js application */
  initApi: ({ config, db, app }: StorefrontApiContext): void => {
    let api = Router();

    // mount the order resource
    api.use('/version', version({ config, db }));
    registerExtensions({ app, config, db, registeredExtensions: config.get('modules.templateModule.registeredExtensions'), rootPath: path.join(__dirname, 'api', 'extensions') })

    // api router
    app.use('/template', api);
  }
})

```

**Please note:** You don't have to implement all the methods. If your module is adding some graphql entities - please feel free to implement `initGraphql` and leave the other functions un-implemented.

## How the default module structure looks like?

There is no required module structure, however typically the modules consist the following folder structure ([example](https://github.com/DivanteLtd/storefront-api/tree/develop/src/modules/template-module)):

```bash
|____graphql                        # graphql resolvers and schema
| |____resolvers.js                 # resolvers.js and schema.js returns the array of typedefs and resolvers using fileLoader()
| |____schema.js
| |____hello                        # you might want to have your schema in subfolders **.* is used for loading it
| | |____schema.graphqls
| | |____resolver.js
|____api                            # typically the API is divided into subfolders as well
| |____version.js
| |____extensions
|____index.ts
|____elasticsearch                  # json objects compatbible with Elastic Mappings
| |____elastic.schema.custom.json
```

## How can I query the ElasticSearch?

All the infrastructure is there. You might want to check how [default-catalog](https://github.com/DivanteLtd/storefront-api/blob/a66222768bf7fb5f54acf268b6a0bb4e0f94a4cf/src/modules/default-catalog/graphql/elasticsearch/product/resolver.js#L94) is querying the data. However, this example is pretty much complicated as it's using the special Query adapters for advanced filtering.

The simplest example was presented in the [`template-module`](https://github.com/DivanteLtd/storefront-api/blob/develop/src/modules/template-module/graphql/hello/resolver.js):

```js
    testElastic: async (_, { sku }, context, rootValue) => {
      const client = es.getClient(config)
      const esQuery = es.adjustQuery({
        index: 'vue_storefront_catalog', // current index name
        type: 'product',
        body: bodybuilder().filter('terms', 'visibility', [2, 3, 4]).andFilter('term', 'status', 1).andFilter('terms', 'sku', sku).build()
      }, 'product', config)
      const response = es.getResponseObject(await client.search(esQuery)).hits.hits.map(el => { return el._source })
      if (response.length > 0) return response[0]; else return null
    }
```

As you can see - there is [`bodybuilder`](http://bodybuilder.js.org/) included and the elastic client - ready for your commands!

## How do I create a new module?

Please read the [tutorial.md](./tutorial.md). The simplest way is to just copy the [`template-module`](https://github.com/DivanteLtd/storefront-api/tree/develop/src/modules/template-module).

## Is there a way to extend the default modules?

There is no explicit way to extend the existing module other than just creating a new module and using the composition (importing the elements you'd like to reuse) from the base/fallback module.

