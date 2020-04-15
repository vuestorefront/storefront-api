import config from 'config';
import client from '../client';
import { buildQuery } from '../queryBuilder'
import { getIndexName } from '../mapping'
import { adjustQuery, getResponseObject } from '@storefront-api/lib/elastic'
import { aggregationsToAttributes } from '../attribute/aggregations'

export async function list ({ search, filter, currentPage, pageSize = 200, sort, context, rootValue = null, _sourceIncludes, _sourceExcludes = null }) {
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

export async function listBreadcrumbs ({ category, context, addCurrentCategory = false }) {
  const ids = (category.parent_ids || (category.path && category.path.split('/')) || [])
    .filter((id) => String(id) !== String(category.id))
  const _sourceIncludes = ['id', 'name', 'slug', 'path', 'level']
  const filter = {
    id: { in: ids }
  }
  const response = await list({
    search: '',
    filter,
    currentPage: 0,
    pageSize: 200,
    sort: null,
    context,
    _sourceIncludes
  })
  const validResponse = (response && response.items) || []
  const categoryList = (addCurrentCategory ? [...validResponse, category] : validResponse)
    .sort((a, b) => a.level - b.level)
    .map(({ id, level, ...rest }) => ({category_id: id, ...rest}))

  return categoryList
}
