import { StoreFrontResloverContext } from '@storefront-api/lib/module/types';
import { IResolvers } from 'apollo-server-express';
import es from '@storefront-api/lib/elastic'
import bodybuilder from 'bodybuilder'

const resolver: IResolvers<any, StoreFrontResloverContext> = {
  Query: {
    sayHello: (_, { name }, context, rootValue) => {
      return `Hello ${name}!`
    },
    testElastic: async (_, { sku }, { db, config }, rootValue) => {
      const client = db.getElasticClient()
      const esQuery = es.adjustQuery({
        index: 'vue_storefront_catalog', // current index name
        type: 'product',
        body: bodybuilder().filter('terms', 'visibility', [2, 3, 4]).andFilter('term', 'status', 1).andFilter('terms', 'sku', sku).build()
      }, 'product', config)
      const response = es.getResponseObject(await client.search(esQuery)).hits.hits.map(el => { return el._source })
      if (response.length > 0) return response[0]; else return null
    }
  }
};

export default resolver;
