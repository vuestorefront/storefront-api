Storefront API
==============

<div align="center"><img src="https://divante.com/github/storefront-api/sfa-logo.png" style="text-align:center;" width="400" /></div>

![version](https://img.shields.io/badge/node-v10.x-blue.svg)
![Branch Develop](https://img.shields.io/badge/dev%20branch-develop-blue.svg)
<a href="http://slack.vuestorefront.io">![Join Slack](https://img.shields.io/badge/community%20chat-slack-FF1493.svg)</a>

### 🔨 Current status: Release Candidate 2 (rc2)

Most of the work has been done already. However, we are still developing and enhancing it. Storefront API 1.0rc2 is compatible with Vue Storefront 1.11+. The stable release (1.0) is planned for **2020Q4**. Only then, it will replace the `vue-storefront-api` middleware for Vue Storefront (release 1.13). Till then it's not recommended for production applications.

Storefront GraphQL API. Easy to use. Extendable. Blazingly fast. ElasticSearch included. [BFF (Backend for frontend)](https://samnewman.io/patterns/architectural/bff/) driven.
Works great with: Magento1, Magento2, Spree, OpenCart, and Pimcore - out of the box. [Easy to integrate with custom backends](https://docs.storefrontapi.com/guide/integration/integration.html#two-steps-for-the-integration).

You can use the **Storefront GraphQL API** to integrate **all your backend systems** with your eCommerce frontend under a single GraphQL/REST API.
By default, all catalog information is stored in ElasticSearch, and all the write operations are forwarded to the **platform driver** (Magento1, Magento2, Spree, and others available).

## How to get started?

Storefront API comes with a default product schema - compatible with the [Vue Storefront](https://github.com/DivanteLtd/vue-storefront) project - and can be a drop-in replacement for `vue-storefront-api`. You can  start a dev instance, including a demo data set integrated with a [Magento 2.3 demo instance](http://demo-magento2.vuestorefront.io).

To run `storefront-api` in `development` mode, please run:

`docker-compose up`

Restore the demo data set:
`docker exec -it sfa_app_1 yarn restore7`

After successful installation, you can start playing with GraphQL queries using your local GraphQL Playground, which is exposed under: [http://localhost:8080/graphql](http://localhost:8080/graphql)

Details: 
- [Installation tutorial](https://docs.storefrontapi.com/guide/general/installation.html)
- [How to create a first module - tutorial](https://docs.storefrontapi.com/guide/modules/tutorial.html)
- [GraphQL schema](https://docs.storefrontapi.com/guide/default-modules/graphql.html)
- [REST API](https://docs.storefrontapi.com/guide/default-modules/api.html)
- [Configuration file explained](https://docs.storefrontapi.com/guide/general/config.html)

## Core Team

In case of any questions please contact our core team ([we are on Slack](https://slack.vuestorefront.io))

- `@resubaka` - Jens Sadowski
- `@pkarw` - Piotr Karwatka
- `@pandrzejewsky` - Patryk Andrzejewski


## Demo

You can play with the GraphQL endpoint over https://demo.storefrontapi.com/graphql/

Example query you can enter:

```graphql
{ 
  products (filter:{
      type_id:{eq:"configurable"}
  }) {
    items { 
      name
      price
      description
      configurable_children { name, price }
    }
  }
}
```

## Key features

 - Fully functional and extendable eCommerce API Gateway,
 - Modular architecture with easy customizable default e-Commerce module,
 - Read/Write integrations with [Magento1](https://github.com/DivanteLtd/magento1-vsbridge-indexer), [EpiServer](https://github.com/makingwaves/epi-commerce-to-vue-storefront), [Magento2](https://github.com/DivanteLtd/magento2-vsbridge-indexer), [OpenCart](https://github.com/butopea/vue-storefront-opencart-vsbridge), [SpreeCommerce](https://github.com/spark-solutions/spree2vuestorefront),
 - Additional integrations including [Prismic](https://forum.vuestorefront.io/t/prismic-connector/160) with GraphQL support,
 - [Vue Storefront](https://vuestorefront.io) PWA frontend support,
 - Blazingly fast - based on ElasticSearch with avg. response times < 100ms,
 - GraphQL API with 100% customizable [GraphQL schema](https://divanteltd.github.io/storefront-graphql-api-schema/),
 - REST API with [ElasticSearch DSL support](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl.html),
 - Catalog, Cart, User, Stock, Review, Order, and Image resizer modules available through the REST API,
 - Multistore support based on a store-views (aka. sales channels) concept,
 - Dynamic tax calculation engine,
 - Extendable via custom extensions (including GraphQL schema and resolver extensions),
 - ElasticSearch maintenance tools - dump/restore/schema maintenance/migrations,
 - Custom eCommerce Backend integrations via [an integration SDK](ocs.storefrontapi.com/guide/integration/integration.html#two-steps-for-the-integration).

## Modules

Storefront API does provide all the features, GraphQL schemas, ElasticSearch resolvers and API handlers via [Modules](https://docs.storefrontapi.com/guide/modules/introduction.html). That's it. The default schema and the features described in the further parts of the documentation have been implemented by the `default-catalog`, `default-img` and `default-vsf` modules. You can customize them, clone or disable.

Each module provides it's own:
- GraphQL schema and resolvers,
- ElasticSearch mappings,
- API methods - via express.js handlers and middlewares.

[Read more on Storefront API modules](https://docs.storefrontapi.com/guide/modules/introduction.html)
[Read more on The Default modules](https://docs.storefrontapi.com/guide/modules/default-modules/introduction.html)

<img src="https://divante.com//github/storefront-api/storefront-api-architecture.png" alt="Storefront API architecture" />

## Production-ready

Storefront API originated from the [`vue-storefront-api`](https://github.com/DivanteLtd/vue-storefront-api) project and is currently [backing 30+ production sites](https://www.vuestorefront.io/live-projects/), including: [Zadig&Voltaire](https://zadig-et-voltaire.com/pt/en/), [Klebefieber](https://www.klebefieber.de/), [Wonect](https://wonect.com/sg/) and others.

## Documentation

Please check our [**Official documentation**](https://docs.storefrontapi.com/). You will find there some integration and customization tutorials, and the API specification.

## Example use cases

 - **Headless eCommerce data source** for any React/Vue/Angular frontend connected to Magento or any other supported eCommerce platform,
 - **GraphQL Gateway** which takes data from **an existing REST API and mixes it** with ElasticSearch or Database data,
 - **Custom GraphQL schema** - optimized for your backend platform,
 - **Custom eCommerce Backend** - by implementing custom Cart, User, Stock modules and re-using the Catalog service.
 
## Requirements

- Docker and Docker Compose

The following are already included in the `storefront-api` Docker image, but required if you do not use containerization:
- Node.js 10.x or higher
- Yarn

## REST Access
Catalog API calls are compliant with ElasticSearch (they work like a filtering proxy to ES). More on ES query here: [ElasticSearch queries tutorial](http://okfnlabs.org/blog/2013/07/01/elasticsearch-query-tutorial.html)

The Elastic search endpoint is: `http://localhost:8080/api/catalog/search/<INDEX_NAME>/`. You can run the following command to check if everything is up and runing (it assumes `vue_storefront_catalog` as the default index name):

`curl -i http://elastic:changeme@localhost:8080/api/catalog/vue_storefront_catalog/_search`

## Data formats

The data formats can be easily modified to suit your needs by modifying the `src/graphql/elasticsearch/**` schemas and resolvers.
Check our [GraphQL Schema documentation](https://divanteltd.github.io/storefront-graphql-api-schema/) for the details regarding data formats.

## Adding custom modules with their dependencies (Yarn only)
When adding custom modules(https://docs.storefrontapi.com/guide/modules/introduction.html), you might want to define some dependencies inside them. Thanks to [Yarn workspaces](https://yarnpkg.com/lang/en/docs/workspaces/), dependencies defined inside your custom module will be installed when you execute `yarn` at the project root level, so it's way easier and faster than installing all modules dependencies separately.

To do this, define the `package.json` with your dependencies in your custom module:
- `src/modules/{your-custom-extension}/package.json` 
- `src/platforms/{your-custom-platform}/package.json`

NOTE: `npm` users will still have to install the dependencies individually in their modules.

## Self-signed certificates

In non-production environments, other services often use self-signed certificates for secure connections.
You can easily set up the application to trust them by putting them in the config/certs directory.

## Contributing

If you like the idea behind Vue Storefront and want to become a contributor, do not hesitate and check our [list of the issues](https://github.com/DivanteLtd/storefront-api/issues) or contact us directly via contributors@vuestorefront.io.

If you have discovered a bug, or have a feature suggestion, feel free to create an issue on Github.

## The Story

Storefront API is brought to you by the [**Vue Storefront Team**](https://www.vuestorefront.io/) and is based on [Vue Storefront API](https://github.com/DivanteLtd/vue-storefront-api). The intention is to replace vue-storefront-api with a more general-purpose API Gateway which you may use with any web or mobile frontend, including Vue, React, Angular and native apps. Its a drop-in replacement for `vue-storefront-api` if you happened to use it before. It works great with [Vue Storefront](https://github.com/DivanteLtd/vue-storefront).

<img src="https://divante.com/github/storefront-api/graphql-playground.png" alt="GraphQL Playground is included"/>
<em style="text-align:center;">This is a screenshot showing the GraphQL Playground on the storefront-api schema. <a href="https://divanteltd.github.io/storefront-graphql-api-schema/">Check the schema docs</a>. It can be 100% customized.</em>


## Partners

Storefront API is a Community effort brought to you by our great **Vue Storefront Core Team** and supported by the following companies:

<table>
  <tbody>
    <tr>
      <td align="center" valign="middle">
        <a href="https://divante.com/">
          <img
            src="https://divante.com/github/shopware-pwa/Divante_logo_1.png"
            alt="Divante"
            width="150"
          >
        </a>
      </td>
      <td align="center" valign="middle">
          <a href="https://vendic.nl/">
          <img
            src="https://divante.co/partners/Vue-Storefront/vendic-rood.png"
            alt="Vendic"
            width="150"
          >
        </a>
      </td>
      <td align="center" valign="middle">
     <a href="https://www.getnoticed.nl/">
          <img
            src="https://user-images.githubusercontent.com/18116406/38860463-87a9fff4-4230-11e8-8017-e5ffb73e77f9.png"
            alt="Get.Noticed"
            width="150"
          >
        </a>
      </td>
      <td align="center" valign="middle">
       <a href="https://www.bitbull.it/">
          <img
            src="https://user-images.githubusercontent.com/18116406/38270766-b0bc4fc0-3784-11e8-9463-99d88950ca9a.png"
            alt="Bitbull"
            width="150"
          >
        </a>
      </td>
      <td align="center" valign="middle">
       <a href="https://www.sotechnology.co.uk/">
          <img
            src="https://divante.co/partners/Vue-Storefront/SOtech-logo%20(1).png"
            alt="SOtechnology"
            width="150"
          >
        </a>
      </td>
    </tr>
    <tr>
      <td align="center" valign="middle">
        <a href="http://macopedia.com/pl">
          <img
            src="https://blog.vuestorefront.io/wp-content/uploads/2020/02/macopedia_blue_logo.png"
            alt="Macopedia"
            width="150"
          >
        </a>
      </td>
      <td align="center" valign="middle">
        <a href="http://www.develodesign.co.uk/">
          <img
            src="docs/.vuepress/public/partners/develo.png"
            alt="Develo design"
            width="150"
          >
        </a>
      </td>
      <td align="center" valign="middle">
         <a href="https://www.phoenix-media.eu/">
          <img
            src="https://divante.co/partners/Vue-Storefront/PHOENIX_MEDIA_Logo_transparent.png"
            alt="Phoenix Media"
            width="150"
          >
        </a>
      </td>
      <td align="center" valign="middle">
       <a href="https://www.absolutewebservices.com">
          <img
            src="https://divante.co/partners/Vue-Storefront/absolute-logo.png"
            alt="Absolute Web Services"
            height="50"
          >
        </a>
      </td>
      <td align="center" valign="middle">
   <a href="https://www.dnd.fr/">
          <img
            src="https://divante.co/partners/Vue-Storefront/dnd-logo.png"
            alt="Agency DnD"
            height="40"
          >
        </a>
      </td>
    </tr>
    <tr>
      <td align="center" valign="middle">
         <a href="https://www.newfantastic.com">
          <img
            src="https://divante.co/partners/Vue-Storefront/newfantasticLogo.png"
            alt="New Fantastic"
            width="150"
          >
        </a>
      </td>
       <td align="center" valign="middle">
    <a href="https://www.wagento.com">
          <img
            src="https://www.wagento.com/hubfs/logo-standard-color@4x%20(1).png"
            alt="Wagento"
            width="150"
          >
        </a>
      </td>
      <td align="center" valign="middle">
        <a href="http://www.summasolutions.net">
          <img
            src="https://divante.co/partners/Vue-Storefront/summa_logo_horizontal_rgb.jpg"
            alt="Summa Solutions"
            width="150"
          >
        </a>
      </td>
      <td align="center" valign="middle">
        <a href="http://novatize.com/">
          <img
            src="https://divante.co/partners/Vue-Storefront/Novatize_Logo_K.png"
            alt="Novatize"
            width="150"
          >
        </a>
      </td>
      <td align="center" valign="middle">
        <a href="https://www.imaginationmedia.com/">
          <img
            src="https://user-images.githubusercontent.com/18116406/39051477-0c46c1aa-44a9-11e8-8f53-0adabe3e66a4.png"
            alt="Imagination Media"
            width="150"
          >
        </a>
      </td>
    </tr>
    <tr>
        <td align="center" valign="middle">
        <a href="https://magedirect.co/">
          <img
            src="https://user-images.githubusercontent.com/18116406/38415925-4a31e358-3993-11e8-9bee-b2b9af95d305.png"
            alt="MageDirect"
            width="100"
          >
        </a>
      </td>
      <td align="center" valign="middle">
        <a href="https://www.edmondscommerce.co.uk/">
          <img
            src="https://divante.co/partners/Vue-Storefront/edmonds-ecommerce.png"
            alt="Edmonds Commerce"
            width="150"
          >
        </a>
      </td>
      <td align="center" valign="middle">
        <a href="https://www.kt-team.ru/">
          <img
            src="https://divante.co/partners/Vue-Storefront/kt.team.png"
            alt="KT Team"
            width="150"
          >
        </a>
      </td>
      <td align="center" valign="middle">
        <a href="https://magebit.com/">
          <img
            src="https://divante.co/partners/Vue-Storefront/Magebit_150px.png"
            alt="MageBit"
            width="150"
          >
        </a>
      </td>
      <td align="center" valign="middle">
        <a href="https://upsidelab.io/">
          <img
            src="https://divante.co/partners/Vue-Storefront/upside-logo@4x.png"
            alt="UpsideLab"
            width="150"
          >
        </a>
      </td>
    </tr>
     <tr>
       <td align="center" valign="middle">
        <a href="http://meigee.team/">
          <img
            src="https://divante.co/partners/Vue-Storefront/meigee.png"
            alt="Meigee"
            width="150"
          >
        </a>
      </td>
         <td align="center" valign="middle">
        <a href="https://webvisum.de/">
          <img
            src="https://divante.co/partners/Vue-Storefront/Webvisium-Logo.png"
            alt="WebVisum"
            width="150"
          >
        </a>
      </td>
      <td align="center" valign="middle">
           <a href="https://magenest.com/">
          <img
            src="https://user-images.githubusercontent.com/18116406/37145068-3326bdf8-22c0-11e8-9bc1-0b9b2377129f.png"
            alt="Magenest"
            width="150"
          >
        </a>
      </td>
  <td align="center" valign="middle">
        <a href="https://viaict.com/">
          <img
            src="https://www.viaict.com/img/viaict_flat_design_300.png"
            alt="Viaict"
            width="150"
          >
        </a>
      </td>
        <td align="center" valign="middle">
        <a href="https://bemeir.com/vue-storefront">
          <img
            src="https://divante.co/partners/Vue-Storefront/bemeir.png"
            alt="Bemeir"
            width="150"
          >
        </a>
      </td>
    </tr>
     <tr>
       <td align="center" valign="middle">
        <a href="http://copex.io/">
          <img
            src="https://divante.co/partners/Vue-Storefront/copex-io-logo.png"
            alt="Copex.io"
            width="150"
          >
        </a>
      </td>
         <td align="center" valign="middle">
        <a href="https://www.codilar.com/">
          <img
            src="https://divante.co/partners/Vue-Storefront/codilar_logo.png"
            alt="Codilar"
            height="50"
          >
        </a>
      </td>
        <td align="center" valign="middle">
        <a href="https://www.mediact.nl/">
          <img
            src="https://divante.co/partners/Vue-Storefront/Logo-MediaCT-XL.png"
            alt="MediaCT"
            height="50"
          >
        </a>
      </td>
      <td align="center" valign="middle">
        <a href="https://www.improving.dk/">
          <img
            src="https://divante.co/partners/Vue-Storefront/Improving_sh_logo.png"
            alt="Improving"
            height="50"
          >
        </a>
      </td>
      <td align="center" valign="middle">
       <a href="https://www.ecommbits.com/en/">
          <img
            src="https://user-images.githubusercontent.com/18116406/37145348-ea9c8ba2-22c0-11e8-9a91-d1a1da9af782.png"
            alt="ECOMMBITS"
            width="150"
          >
        </a>
      </td>
    </tr>
     <tr>
       <td align="center" valign="middle">
        <a href="https://www.devmetokyo.com/">
          <img
            src="https://divante.co/partners/Vue-Storefront/devMeTokyo-logo.png"
            alt="DevMe Tokyo"
            height="50"
          >
        </a>
      </td>
   <td align="center" valign="middle">
        <a href="https://coreshopsolutions.com/">
          <img
            src="https://divante.co/partners/Vue-Storefront/coreshop-solutions.png"
            alt="CoreShop Solutions"
            height="40"
          >
        </a>
      </td>
       <td align="center" valign="middle">
        <a href="https://aureatelabs.com/">
          <img
            src="https://divante.co/partners/Vue-Storefront/Aureate-Labs-Logo.png"
            alt="Aureate Labs"
            height="40"
          >
        </a>
</td>
  <td align="center" valign="middle">
<a href="https://www.guapa.nl/">
          <img
            src="https://divante.co/partners/Vue-Storefront/Guapa-color.png"
            alt="Guapa eCommerce"
            height="40"
          >
        </a>
</td>
<td align="center" valign="middle">
<a href="http://rightshore.consulting/">
          <img
            src="https://divante.co/partners/Vue-Storefront/rightshore-consulting.png"
            alt="Rightshore Consulting"
            height="40"
          >
        </a></td>
    </tr>
         <tr>
     <td align="center" valign="middle">
<a href="https://webisoft.com/">
          <img
            src="https://divante.co/partners/Vue-Storefront/webisoft.png"
            alt="Webisoft"
            height="30"
          >
        </a>
</td>
  <td align="center" valign="middle">
<a href="http://madepeople.se">
          <img
            src="https://divante.co/partners/Vue-Storefront/MadePeople.png"
            alt="Made People"
            height="40"
          >
        </a>
</td>
     <td align="center" valign="middle">
  <a href="https://www.optiweb.com/">
          <img
            src="https://user-images.githubusercontent.com/18116406/37145626-9d48077c-22c1-11e8-82fd-dda1268d05e9.png"
            alt="Optiweb"
            width="150"
          >
        </a>
</td>
  <td align="center" valign="middle">
<a href="https://www.vaimo.com/">
          <img
            src="https://divante.co/partners/Vue-Storefront/vaimo-logo.png"
            alt="Vaimo"
            height="40"
          >
        </a>
</td>
  <td align="center" valign="middle">
<a href="https://www.makingwaves.com/">
          <img
            src="https://divante.co/partners/Vue-Storefront/making-waves.png"
            alt="Making Waves"
            height="40"
          >
        </a>
</td>
    </tr>
<tr>
      <td align="center" valign="middle">
<a href="https://www.bluebirdday.nl/">
          <img
            src="https://divante.co/partners/Vue-Storefront/Blue-Bird.png"
            alt="BlueBird Day"
            height="30"
          >
        </a>
</td>
  <td align="center" valign="middle">
<a href="https://lightcom.io/">
          <img
            src="https://blog.vuestorefront.io/wp-content/uploads/2020/03/lightcom_logo.png"
            alt="Lightcom"
            height="25"
          >
        </a>
</td>
      <td align="center" valign="middle">
<a href="https://portaltech.reply.com/portaltech/en/">
          <img
            src="https://divante.co/partners/Vue-Storefront/Portaltech-Reply-LOGO-RGB.png"
            alt="Portaltech Reply"
            height="40"
          >
        </a>
</td>
    <td align="center" valign="middle">
<a href="www.interactivated.nl">
          <img
            src="https://divante.co/partners/Vue-Storefront/interactivated-logo.png"
            alt="Interactivated"
            height="40"
          >
        </a>
</td>
   <td align="center" valign="middle">
<a href="https://www.sutunam.com/">
          <img
            src="https://divante.co/partners/Vue-Storefront/Sutunam_H_Logo_LightBg.png"
            alt="Sutunam"
            height="40"
          >
        </a>
</td>
    </tr>
    <tr>
      <td align="center" valign="middle">
    <a href="http://www.acidgreen.com.au/">
          <img
            src="https://cdn.dribbble.com/users/469310/screenshots/3865916/acidgreen_logo.jpg"
            alt="Acid Green"
            width="150"
          >
        </a>
</td>
  <td align="center" valign="middle">
<a href="https://www.bergwerk.ag/">
          <img
            src="https://divante.co/partners/Vue-Storefront/BERGWERK_Logo.png"
            alt="BERGWERK"
            height="40"
          >
        </a>
</td>
      <td align="center" valign="middle">
<a href="https://zero1.co.uk/">
          <img
            src="https://divante.co/partners/Vue-Storefront/zero-1_logo.png"
            alt="Zero1"
            height="40"
          >
        </a>
</td>
    <td align="center" valign="middle">
<a href="https://www.novusweb.com/">
          <img
            src="https://divante.co/partners/Vue-Storefront/blue_novusweb.png"
            alt="Novusweb"
            height="30"
          >
        </a>
</td>
   <td align="center" valign="middle">
<a href="www.trellis.co">
          <img
            src="https://divante.co/partners/Vue-Storefront/trellis.png"
            alt="Trellis"
            height="30"
          >
        </a>
</td>
    </tr>
      <tr>
      <td align="center" valign="middle">
<a href="https://ittweb.net/it?utm_source=referral&utm_medium=vsf&utm_campaign=partners">
          <img
            src="https://divante.co/partners/Vue-Storefront/ITTweb.png"
            alt="ITT Web"
            height="40"
          >
        </a>
</td>
  <td align="center" valign="middle">
<a href="https://www.yireo.com/">
          <img
            src="https://divante.co/partners/Vue-Storefront/yireo-logo-trans-520x520.png"
            alt="Yireo"
            height="40"
          >
        </a>
</td>
     <td align="center" valign="middle">
<a href="https://www.tam-tam.co.jp">
          <img
            src="https://divante.co/partners/Vue-Storefront/tam%20logo.png"
            alt="TAM"
            height="40"
          >
        </a>
</td>
    <td align="center" valign="middle">
<a href="https://www.ambientia.ee/">
          <img
            src="https://divante.co/partners/Vue-Storefront/Ambientia%20logo%20RED%20RGB.png"
            alt="Ambientia"
            height="40"
          >
        </a>
</td>
   <td align="center" valign="middle">
<a href="https://performance-academy.pl/">
          <img
            src="https://divante.co/partners/Vue-Storefront/Perfomance_Academy_logo_large.png"
            alt="Performance Academy"
            height="40"
          >
        </a>
</td>
    </tr>
     <tr>
      <td align="center" valign="middle">
<a href="https://sparksolutions.co/">
          <img
            src="https://divante.co/partners/Vue-Storefront/logo%20spark%20kolor.png"
            alt="Spark Solutions"
            height="40"
          >
        </a>
</td>
  <td align="center" valign="middle">
<a href="https://www.caupo.se/">
          <img
            src="https://divante.com/partners/Vue-Storefront/Caupo_logo_2019.svg"
            alt="Caupo"
            height="40"
          >
        </a>
</td>
     <td align="center" valign="middle">
<a href="https://netformic.de/">
          <img
            src="https://divante.com/partners/Vue-Storefront/NF_Logo_2019_RGB@4x.png"
            alt="Netformic"
            height="40"
          >
        </a>
</td>
    <td align="center" valign="middle">
<a href="http://www.highdigital.de/">
          <img
            src="https://divante.com/partners/Vue-Storefront/highdigital.png"
            alt="Highdigital"
            height="40"
          >
        </a>
</td>
   <td align="center" valign="middle">
<a href="https://kiwicommerce.co.uk/">
          <img
            src="https://divante.com/partners/Vue-Storefront/KiwiCommerce%20Logo.png"
            alt="KiwiCommerce"
            height="40"
          >
        </a>
</td>
    </tr>
    <tr>
      <td align="center" valign="middle">
<a href="https://www.helloevery1.com/">
          <img
            src="https://divante.com/partners/Vue-Storefront/every1-logo.png"
            alt="every1"
            height="40"
          >
        </a>
</td>
  <td align="center" valign="middle">
<a href="https://www.solveda.com/">
          <img
            src="https://blog.vuestorefront.io/wp-content/uploads/2020/02/SOLVEDA_logo.png"
            alt="Solveda"
            height="40"
          >
        </a>
</td>
     <td align="center" valign="middle">
<a href="https://www.devlineagency.com/">
          <img
            src="https://divante.com/partners/Vue-Storefront/devline.png"
            alt="Devline"
            height="40"
          >
        </a>
</td>
    <td align="center" valign="middle">
<a href="https://appeal.digital/">
          <img
            src="https://divante.com/partners/Vue-Storefront/appeal-digital%20(1).png"
            alt="Appeal Digital"
            height="40"
          >
        </a>
</td>
   <td align="center" valign="middle">
<a href="https://www.rvsmedia.co.uk/">
          <img
            src="https://divante.com/partners/Vue-Storefront/rvsmedia_logo.png"
            alt="RVS Media"
            height="40"
          >
        </a>
</td>
    </tr>
        <tr>
      <td align="center" valign="middle">
<a href="https://www.hotwax.co/">
          <img
            src="https://divante.com/partners/Vue-Storefront/HotWax.png"
            alt="HotWax"
            height="40"
          >
        </a>
</td>
  <td align="center" valign="middle">
<a href="https://www.sitewards.com/">
          <img
            src="https://divante.com/partners/Vue-Storefront/sitewards-logo.png"
            alt="Sitewards"
            height="40"
          >
        </a>
</td>
     <td align="center" valign="middle">
<a href="https://codecoda.com/en">
          <img
            src="https://divante.com/partners/Vue-Storefront/codecoda-logo.png"
            alt="CodeCoda"
            height="40"
          >
        </a>
</td>
    <td align="center" valign="middle">
         <a href="https://bitbag.io/services/pwa-progressive-web-app/">
          <img
            src="https://blog.vuestorefront.io/wp-content/uploads/2020/02/BitBag_logo.png"
            alt="BitBag"
            height="40" >
        </a>
</td>
   <td align="center" valign="middle">
<a href="https://www.ohmybrand.es/">
          <img
            src="https://blog.vuestorefront.io/wp-content/uploads/2020/02/ohmybrand_logo_blue.png"
            alt="Oh My Brand"
            height="40"
          >
        </a>
</td>
    </tr>
            <tr>
      <td align="center" valign="middle">
<a href="https://www.2hatslogic.com/">
          <img
            src="https://blog.vuestorefront.io/wp-content/uploads/2020/03/2hatslogic-logo.png"
            alt="2hatslogic"
            height="40"
          >
        </a>
</td>
  <td align="center" valign="middle">
<a href="">
          <img
            src=""
            alt=""
            height="40"
          >
        </a>
</td>
     <td align="center" valign="middle">
<a href="">
          <img
            src=""
            alt=""
            height="40"
          >
        </a>
</td>
    <td align="center" valign="middle">
    <a href="">
          <img
            src=""
            alt=""
            height="40"
          >
        </a>
</td>
   <td align="center" valign="middle">
<a href="">
          <img
            src=""
            alt=""
            height="40"
          >
        </a>
</td>
    </tr>
  </tbody>
</table>

Partners are encouraged to support the project in various ways - mostly by contributing to the source code, performing marketing activities, evangelizing and, of course, implementing production projects. We support our partners via dedicated contact channels, workshops, and by sharing leads from merchants interested in implementations.

If you would like to become our Partner, just let us know via contributors@vuestorefront.io.

## License

[MIT](./LICENSE)
