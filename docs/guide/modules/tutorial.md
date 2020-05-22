# Creating a new module

Storefront API modules are a great way to add custom GraphQL schemas, REST API endpoints or customize the ElasticSearch mappings. The easiest way to create a new module is to use the [https://github.com/DivanteLtd/storefront-api/tree/develop/src/modules/template-module] as a boilerplate.

## 1. Create a repository

The [`storefront-api`](https://github.com/DivanteLtd/storefront-api) is a `Template`. That means you can use the `Use template` feature to create a new repository for customizing the API:

![Use template](https://divante.com/github/storefront-api/tutorial/step_1_use_template.png)

Then you need to name your repository properly:

![Prepare your repository](https://divante.com//github/storefront-api/tutorial/step_2_prepare_repo.png)


You can find [my demo repository here](https://github.com/pkarw/storefront-api-example). **Note:** It's based on SFAPI 1.0RC1. With SFAPI 1.0RC2, we've introduced the `packages/` monorepo containing some of the core modules previously available in the `src/modules`.


## 2. Setup Storefront API

The installation process is pretty straightforward. You start by cloning your brand new repo:

```bash
pkarwatka$ git clone https://github.com/pkarw/storefront-api-example.git
Cloning into 'storefront-api-example'...
remote: Enumerating objects: 309, done.
remote: Counting objects: 100% (309/309), done.
remote: Compressing objects: 100% (278/278), done.
remote: Total 309 (delta 35), reused 0 (delta 0), pack-reused 0
Receiving objects: 100% (309/309), 1.42 MiB | 882.00 KiB/s, done.
Resolving deltas: 100% (35/35), done.
Checking connectivity... done.
pkarwatka$ cd storefront-api-example/
pkarwatka$
```

Then, install the dependencies:

```bash
pkarwatka$ yarn
yarn install v1.17.3
[1/4] 🔍  Resolving packages...
[2/4] 🚚  Fetching packages...
[3/4] 🔗  Linking dependencies...
[4/4] 🔨  Building fresh packages...
✨  Done in 16.57s.
pkarwatka$
```

OK, now we can run the whole thing and import some sample data:

```bash
pkarwatka$ docker-compose up
Recreating elasticsearch ...
Recreating elasticsearch ... done
Recreating sfa_app_1     ... done
... # a lot of random log messages ;)
app_1    | Extension mailchimp-subscribe registered under /ext/mailchimp-subscribe base URL
app_1    | info: Winston logging library initialized.
app_1    | Extension example-magento-api registered under /ext/example-magento-api base URL
app_1    | Extension cms-data registered under /ext/cms-data base URL
app_1    | Extension mail-service registered under /ext/mail-service base URL
app_1    | Extension example-processor registered under /ext/example-processor base URL
app_1    | Extension elastic-stock registered under /ext/elastic-stock base URL
app_1    | API Modules registration finished. { succesfulyRegistered: '5 / 5',
app_1    |   registrationOrder:
app_1    |    [ { key: 'default-vsf',
app_1    |        initMiddleware: [Function: initMiddleware],
app_1    |        initApi: [Function: initApi] },
app_1    |      { key: 'vsf-default',
app_1    |        loadMappings: [Function: loadMappings],
app_1    |        initGraphql: [Function: initGraphql],
app_1    |        initApi: [Function: initApi] },
app_1    |      { key: 'default-img', initApi: [Function: initApi] },
app_1    |      { key: 'sample-api', initApi: [Function: initApi] },
app_1    |      { key: 'template-module',
app_1    |        initGraphql: [Function: initGraphql],
app_1    |        loadMappings: [Function: loadMappings],
app_1    |        initApi: [Function: initApi] } ] }
app_1    | Storefront GraphQL API started at http://0.0.0.0:8080
```

The last step before we really get into developing the module is to restore some demo data:

```bash
pkarwatka$ docker exec -it sfa_app_1 yarn restore7
yarn run v1.13.0
$ export TS_NODE_PROJECT="tsconfig.json" && ts-node -r tsconfig-paths/register scripts/elastic7.ts restore --output-index=vue_storefront_catalog && npm run db7 rebuild --indexName=vue_storefront_catalog
... # way more super cool log messages ...
** Removing the original index
Index alias created
** Creating alias
Public index alias does not exists index_not_found_exception
** Creating alias
Public index alias does not exists index_not_found_exception
Index alias created
Index alias created
** Removing the original index
** Creating alias
Public index alias does not exists index_not_found_exception
Index alias created
** Removing the original index
** Creating alias
Public index alias does not exists index_not_found_exception
Index alias created
** Removing the original index
** Creating alias
Public index alias does not exists index_not_found_exception
Index alias created
Done in 62.18s.
```

## 3. Use the template

The easiest way to extend Storefront API is to use the `template-module`:

```bash
pkarwatka$ cd src/modules/
pkarwatka$ ls -l
total 8
-rw-r--r--  1 pkarwatka  staff  399 Dec  5 14:24 index.ts
drwxr-xr-x  4 pkarwatka  staff  128 Dec  5 14:24 sample-api
drwxr-xr-x  6 pkarwatka  staff  192 Dec  5 14:24 template-module
```

We'll use the template by simply copying it:

```bash
pkarwatka$ cp -R template-module/ my-custom-module
pkarwatka$ ls my-custom-module/
api		elasticsearch	graphql		index.ts
```

## 4. Modify the module entry point

Our goal is to add a custom GraphQL query to add two numbers and a REST API, which returns the provided query parameter. Yeah. I know. Sounds silly :) Let's try it out!

First, we need to edit `src/modules/my-custom-module/index.ts` to apply the proper module name - we'll change the `key`, which should be unique, and change the `TemplateModule` object name to `CustomModule`. We'll also simplify the interface - we'll remove `loadMappings` as we don't plan to extend the ElasticSearch mappings.

```js
import { StorefrontApiModule, registerExtensions } from '@storefront-api/lib/module'
import { StorefrontApiContext, GraphqlConfiguration, ElasticSearchMappings } from '@storefront-api/lib/module/types'
import { Router } from 'express'
import resolvers from './graphql/resolvers'
import schema from './graphql/schema'

import path from 'path'
import version from './api/version'
import { loadSchema } from '@storefront-api/lib/elastic'

export const CustomModule: StorefrontApiModule = new StorefrontApiModule({
  key: 'custom-module',

  initGraphql: ({ config, db, app }: StorefrontApiContext): GraphqlConfiguration => {
    return {
      resolvers,
      schema,
      hasGraphqlSupport: true
    }
  },

  initApi: ({ config, db, app }: StorefrontApiContext): void => {
    let api = Router();

    // mount the order resource
    api.use('/sayHello', (req, res) => {
      res.end('Hello ' + req.query.name + '!')
    });
    // api router
    app.use('/custom', api);
  }
})
```

Of course, you might want to define the API handlers in separate files and import them to use with `api.use` or `app.use`.

**Note:** The `registerExtensions` call is 100% optional. It provides you with a way to have dynamic extension points. All the handlers defined in a folder you've provided to this function call (in our example it will be: `src/modules/custom-api/api*`) will be loaded and mounted to the `api` router section. [See example](https://github.com/DivanteLtd/storefront-api/blob/develop/src/modules/default-catalog/api/extensions/elastic-stock/index.js))


## 5. Enable your module

The next step is to load your module in the `src/modules/index.ts` entry point:

```js
import { DefaultVuestorefrontApiModule } from './default-vsf'
import { DefaultCatalogModule } from './default-catalog'
import { DefaultImgModule } from './default-img'
import { SampleApiModule } from './sample-api'
import { TemplateModule } from './template-module'
import { CustomModule } from './my-custom-module'

export default [
  DefaultVuestorefrontApiModule,
  DefaultCatalogModule,
  DefaultImgModule,
  SampleApiModule,
  TemplateModule,
  CustomModule
]
```
Two lines after, just after saving the file, if you take a look at the console output of the `docker-compose up` command, you'll see the following error messages:

```bash
[nodemon] app crashed - waiting for file changes before starting...
app_1    | [nodemon] files triggering change check: src/modules/my-custom-module/index.ts
app_1    | [nodemon] matched rule: /var/www/src/**/*
app_1    | [nodemon] changes after filters (before/after): 1/1
app_1    | [nodemon] restarting due to changes...
app_1    | [nodemon] src/modules/my-custom-module/index.ts
app_1    |
app_1    | [nodemon] starting `yarn lint-gql && ts-node src`
app_1    | [nodemon] spawning
app_1    | [nodemon] child pid: 323
app_1    | $ graphql-schema-linter src/**/*.graphqls
app_1    | /var/www/src/modules/my-custom-module/graphql/hello/schema.graphqls
app_1    | 3:5 Field "Query.sayHello" can only be defined once.    invalid-graphql-schema
app_1    | 8:5 Field "Query.testElastic" can only be defined once. invalid-graphql-schema
app_1    |
app_1    | ✖ 2 errors detected
app_1    | error Command failed with exit code 1.
app_1    | info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.
app_1    | [nodemon] app crashed - waiting for file changes before starting...
```

**Note:** The default `docker-compose up` command runs Storefront API in `development` mode with the `nodemon` based dynamic recompile process. Each time you modify the `*.ts *.js` or `*.graphqls` files, the app gets recompiled, and changes applied.

 This error means we need to modify the GraphQL schema to avoid conflicts with the default template module (the ancestor).

 ## 6. Modify the GraphQL schema

 To modify the GraphQL Schema, we'll just modify the content of `src/modules/my-custom-module/graphql`. First, by renaming the `hello` to `numbers`:

```bash
pkarwatka$ mv hello/
resolver.js      schema.graphqls
pkarwatka$ mv hello/ numbers; ls -l
total 16
drwxr-xr-x  4 pkarwatka  staff  128 Dec  5 14:33 numbers
-rw-r--r--  1 pkarwatka  staff  251 Dec  5 14:33 resolvers.js
-rw-r--r--  1 pkarwatka  staff  245 Dec  5 14:33 schema.js
```

The next step is to modify `numbers/schema.graphqls`:

```graphqls
extend type Query {
    # This is an example call to add numbers
    add (
        firstNumber: Int,
        secondNumber: Int
    ): Int
}
```

Then we need to implement `numbers/resolvers.js`:

```js
export default {
  Query: {
    add: (_, { firstNumber, secondNumber }, context, rootValue) => {
      return firstNumber + secondNumber
    }
  }
}
```

Wow! That was easy!

## 7. Test the GraphQL and API

After the changes made in Step 6, our API should gracefully compile and you should see the following messages in the console:

```bash
$ graphql-schema-linter src/**/*.graphqls
app_1    |
app_1    |
app_1    | ✔ 0 errors detected
app_1    |
app_1    | failed reading file /var/www/config/certs/.gitkeep: Could not parse certificate
app_1    | Extension mailchimp-subscribe registered under /ext/mailchimp-subscribe base URL
app_1    | info: Winston logging library initialized.
app_1    | Extension example-magento-api registered under /ext/example-magento-api base URL
app_1    | Extension cms-data registered under /ext/cms-data base URL
app_1    | Extension mail-service registered under /ext/mail-service base URL
app_1    | Extension example-processor registered under /ext/example-processor base URL
app_1    | Extension elastic-stock registered under /ext/elastic-stock base URL
app_1    | API Modules registration finished. { succesfulyRegistered: '5 / 5',
app_1    |   registrationOrder:
app_1    |    [ { key: 'default-vsf',
app_1    |        initMiddleware: [Function: initMiddleware],
app_1    |        initApi: [Function: initApi] },
app_1    |      { key: 'vsf-default',
app_1    |        loadMappings: [Function: loadMappings],
app_1    |        initGraphql: [Function: initGraphql],
app_1    |        initApi: [Function: initApi] },
app_1    |      { key: 'default-img', initApi: [Function: initApi] },
app_1    |      { key: 'sample-api', initApi: [Function: initApi] },
app_1    |      { key: 'template-module',
app_1    |        initGraphql: [Function: initGraphql],
app_1    |        loadMappings: [Function: loadMappings],
app_1    |        initApi: [Function: initApi] } ] }
app_1    | Storefront GraphQL API started at http://0.0.0.0:8080
```

**Note:** You may use the `yarn lint-gql` command to execute the [graphql-schema-linter](https://github.com/cjoudrey/graphql-schema-linter) over all GraphQL schemas used in the project. It's a pretty useful tool for working with graphql.

Let's check GraphQL first! Open http://localhost:8080/graphql to access the GraphQL Playground.

![GraphQL playground with the simple query](https://divante.com/github/storefront-api/tutorial/step_3_query_result.png)

Looks awesome! Congratulations!

Let's check if the API extension works, as well as the GraphQL features we added. As you might remember, we appended a GET request handler under `/custom/sayHello`. Let's try it out:

```bash
pkarwatka$ curl http://localhost:8080/custom/sayHello?name=Piotr
Hello Piotr!
```

Wow! That looks just awesome :-)
