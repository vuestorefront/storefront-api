import config from 'config';
import client from '../client';
import { buildQuery } from '../queryBuilder';
import { getIndexName } from '../mapping'
import { adjustQuery, getResponseObject } from '../../../../../lib/elastic'

export async function list ({ search, filter, currentPage, pageSize = 200, sort, context, rootValue, _sourceInclude, _sourceExclude }) {
  let query = buildQuery({ search, filter, currentPage, pageSize, sort, type: 'review' });

  const response = getResponseObject(await client.search(adjustQuery({
    index: getIndexName(context.req.url),
    body: query,
    _sourceInclude,
    _sourceExclude
  }, 'review', config)));

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

const resolver = {
  Query: {
    reviews: (_, { search, filter, currentPage, pageSize, sort, _sourceInclude, _sourceExclude }, context, rootValue) =>
      list({ search, filter, currentPage, pageSize, sort, context, rootValue, _sourceInclude, _sourceExclude })
  }
};

export default resolver;
