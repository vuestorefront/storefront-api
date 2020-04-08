import config from 'config';
import client from '../client';
import { buildQuery } from '../queryBuilder'
import { getIndexName } from '../mapping'
import { list as listProducts } from '../product/resolver'
import { adjustQuery, getResponseObject } from '@storefront-api/lib/elastic'
import { aggregationsToAttributes } from '../attribute/aggregations'

async function list ({ search, filter, currentPage, pageSize = 200, sort, context, rootValue, _sourceIncludes, _sourceExcludes = null }) {
  let query = buildQuery({ search, filter, currentPage, pageSize, sort, type: 'category' });

  const esIndex = getIndexName(context.req.url)
  let response = getResponseObject(await client.search(adjustQuery({
    index: esIndex,
    body: query,
    _source_excludes: _sourceExcludes,
    _source_includes: _sourceIncludes
  }, 'category', config)));

  // Process hits
  response.items = []
  response.hits.hits.forEach(hit => {
    let item = hit._source
    item._score = hit._score
    response.items.push(item)
  });

  response = await aggregationsToAttributes(response, config, esIndex)
  response.total_count = response.hits.total

  // Process sort
  let sortOptions = []
  for (var sortAttribute in sort) {
    sortOptions.push(
      {
        label: sortAttribute,
        value: sortAttribute
      }
    )
  }

  response.sort_fields = {}
  if (sortOptions.length > 0) {
    response.sort_fields.options = sortOptions
  }

  response.page_info = {
    page_size: pageSize,
    current_page: currentPage
  }
  return response;
}

export async function listSingleCategory ({ id, url_path, context, rootValue, _sourceIncludes, _sourceExcludes }) {
  const filter = {}
  if (id) filter['id'] = { eq: id }
  if (url_path) filter['url_path'] = { eq: url_path }
  const categoryList = await list({ search: '', filter, currentPage: 0, pageSize: 1, sort: null, context, rootValue, _sourceIncludes, _sourceExcludes })
  if (categoryList && categoryList.items.length > 0) {
    return categoryList.items[0]
  } else {
    return null
  }
}

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
      _.children_data
  }
};

export default resolver;
