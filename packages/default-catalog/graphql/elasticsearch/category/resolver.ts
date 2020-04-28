import { list as listProducts } from '../product/service'
import { list, listSingleCategory, listBreadcrumbs } from './service'

const resolver = {
  Query: {
    categories: (_, { search, filter, currentPage, pageSize, sort, _sourceIncludes }, context, rootValue) =>
      list({ search, filter, currentPage, pageSize, sort, context, rootValue, _sourceIncludes }),
    category: (_, { id, url_path, _sourceIncludes, _sourceExcludes }, context, rootValue) =>
      listSingleCategory({ id, url_path, context, rootValue, _sourceIncludes, _sourceExcludes })
  },
  Category: {
    products: (_, { search, filter, currentPage, pageSize, sort, _sourceIncludes, _sourceExcludes }, context, rootValue) => {
      return listProducts({ filter: Object.assign({}, filter, { category_ids: { in: _.id } }), sort, currentPage, pageSize, search, context, rootValue, _sourceIncludes, _sourceExcludes })
    },
    children: (_, { search }, context, rootValue) =>
      _.children_data,
    breadcrumbs: async (_, { search }, context) => {
      const breadcrumbs = await listBreadcrumbs({ category: _, context })

      return breadcrumbs
    }
  }
};

export default resolver;
