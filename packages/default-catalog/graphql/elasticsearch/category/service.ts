import config from 'config';
import client from '../client';
import { buildQuery } from '../queryBuilder'
import { getIndexName } from '../mapping'
import { adjustQuery, getResponseObject } from '@storefront-api/lib/elastic'
import { aggregationsToAttributes } from '../attribute/aggregations'
import bodybuilder from 'bodybuilder'

export async function list ({ search, filter, currentPage, pageSize = 200, sort, context, rootValue, _sourceIncludes, _sourceExcludes = null }) {
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

export async function listCategoriesById ({ ids, context }) {
  const catQuery = {
    index: getIndexName(context.req.url),
    type: 'category',
    body: bodybuilder().filter('terms', 'id', ids).build()
  }
  const response = getResponseObject(await client.search(adjustQuery(catQuery, 'category', config)))
  return response.hits.hits.map(el => {
    return el._source
  })
}
