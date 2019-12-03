import config from 'config';
import client from '../client';
import { buildQuery } from '../queryBuilder'
import { getIndexName } from '../mapping'
import { list as listProducts } from '../product/resolver'
import { adjustQuery, getResponseObject } from '../../../../../lib/elastic'

async function list ({ search, filter, currentPage, pageSize = 200, sort, context, rootValue, _sourceInclude, _sourceExclude }) {
  let query = buildQuery({ search, filter, currentPage, pageSize, sort, type: 'category' });

  const response = getResponseObject(await client.search(adjustQuery({
    index: getIndexName(context.req.url),
    body: query,
    _source_exclude: _sourceExclude,
    _source_include: _sourceInclude
  }, 'category', config)));

  // Process hits
  response.items = []
  response.hits.hits.forEach(hit => {
    let item = hit._source
    item._score = hit._score
    response.items.push(item)
  });

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

export async function listSingleCategory ({ id, url_path, context, rootValue, _sourceInclude, _sourceExclude }) {
  const filter = {}
  if (id) filter['id'] = { eq: id }
  if (url_path) filter['url_path'] = { eq: url_path }
  const categoryList = await list({ search: '', filter, currentPage: 0, pageSize: 1, sort: null, context, rootValue, _sourceInclude, _sourceExclude })
  if (categoryList && categoryList.items.length > 0) {
    return categoryList.items[0]
  } else {
    return null
  }
}

const resolver = {
  Query: {
    categories: (_, { search, filter, currentPage, pageSize, sort, _sourceInclude }, context, rootValue) =>
      list({ search, filter, currentPage, pageSize, sort, context, rootValue, _sourceInclude }),
    category: (_, { id, url_path, _sourceInclude, _sourceExclude }, context, rootValue) =>
      listSingleCategory({ id, url_path, context, rootValue, _sourceInclude, _sourceExclude })
  },
  Category: {
    products: (_, { search, filter, currentPage, pageSize, sort, _sourceInclude, _sourceExclude }, context, rootValue) => {
      return listProducts({ filter: Object.assign({}, filter, { category_ids: { in: _.id } }), sort, currentPage, pageSize, search, context, rootValue, _sourceInclude, _sourceExclude })
    },
    children: (_, { search }, context, rootValue) =>
      _.children_data
  }
};

export default resolver;
