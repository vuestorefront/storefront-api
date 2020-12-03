import config from 'config';
import client from '../client';
import { buildQuery } from '../queryBuilder';
import esResultsProcessor from './processor'
import { getIndexName } from '../mapping'
import { adjustQuery, getHits } from '@storefront-api/lib/elastic'
import { aggregationsToAttributes } from '../attribute/aggregations'

export async function list ({ filter, sort = null, currentPage = null, pageSize, search = null, context, rootValue, _sourceIncludes = null, _sourceExcludes = null }) {
  const _req = {
    query: {
      _source_excludes: _sourceExcludes,
      _source_includes: _sourceIncludes
    }
  }

  const query = buildQuery({
    filter: filter,
    sort: sort,
    currentPage: currentPage,
    pageSize: pageSize,
    search: search,
    type: 'product'
  });

  const esIndex = getIndexName(context.req.url)

  let response = getHits(await client.search(adjustQuery({
    index: esIndex,
    type: 'product',
    body: query,
    _source_includes: _sourceIncludes,
    _source_excludes: _sourceExcludes
  }, 'product', config)));
  if (response && response.hits && response.hits.hits) {
    // process response result (caluclate taxes etc...)
    response.hits.hits = await esResultsProcessor(response, _req, 'product', esIndex);
  }

  // Process hits
  response.items = []
  response.hits.hits.forEach(hit => {
    const item = hit._source
    item._score = hit._score
    response.items.push(item)
  });

  response = await aggregationsToAttributes(response, config, esIndex)
  response.total_count = response.hits.total

  // Process sort
  const sortOptions = []
  for (const sortAttribute in sort) {
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

export async function listSingleProduct ({ sku, id = null, url_path = null, context, rootValue, _sourceIncludes = null, _sourceExcludes = null }) {
  const filter = {
    sku: undefined,
    id: undefined,
    url_path: undefined
  }
  if (sku) filter.sku = { eq: sku }
  if (id) filter.id = { eq: id }
  if (url_path) filter.url_path = { eq: url_path }
  const productList = await list({ filter, pageSize: 1, context, rootValue, _sourceIncludes, _sourceExcludes })
  if (productList && productList.items.length > 0) {
    return productList.items[0]
  } else {
    return null
  }
}
