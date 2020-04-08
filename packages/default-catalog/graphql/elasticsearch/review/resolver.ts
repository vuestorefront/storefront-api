import config from 'config';
import client from '../client';
import { buildQuery } from '../queryBuilder';
import { getIndexName } from '../mapping'
import { adjustQuery, getResponseObject } from '@storefront-api/lib/elastic'
import { aggregationsToAttributes } from '../attribute/aggregations'

export async function list ({ search, filter, currentPage, pageSize = 200, sort, context, rootValue, _sourceIncludes, _sourceExcludes }) {
  let query = buildQuery({ search, filter, currentPage, pageSize, sort, type: 'review' });

  const esIndex = getIndexName(context.req.url)
  let response = getResponseObject(await client.search(adjustQuery({
    index: esIndex,
    body: query,
    _source_includes: _sourceIncludes,
    _source_excludes: _sourceExcludes
  }, 'review', config)));

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

const resolver = {
  Query: {
    reviews: (_, { search, filter, currentPage, pageSize, sort, _sourceIncludes, _sourceExcludes }, context, rootValue) =>
      list({ search, filter, currentPage, pageSize, sort, context, rootValue, _sourceIncludes, _sourceExcludes })
  }
};

export default resolver;
