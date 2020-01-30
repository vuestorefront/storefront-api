import config from 'config';
import client from '../client';
import { buildQuery } from '../queryBuilder';
import { getIndexName } from '../mapping'
import { adjustQuery, getResponseObject } from '@storefront-api/lib/elastic'

async function list ({ filter, currentPage, pageSize = 200, context, _source_include, type }) {
  let query = buildQuery({ filter, currentPage, pageSize, type });

  const response = getResponseObject(await client.search(adjustQuery({
    index: getIndexName(context.req.url),
    body: query,
    _source_include
  }, type, config)));

  return buildItems(response)
}

function buildItems (response) {
  response.items = []
  response.hits.hits.forEach(hit => {
    let item = hit._source
    item._score = hit._score
    response.items.push(item)
  });

  return response;
}

const resolver = {
  Query: {
    cmsPages: (_, { filter, currentPage, pageSize, _sourceIncludes, type = 'cms_page' }, context) =>
      list({ filter, currentPage, pageSize, _source_include: _sourceIncludes, type, context }),
    cmsBlocks: (_, { filter, currentPage, pageSize, _sourceIncludes, type = 'cms_block' }, context) =>
      list({ filter, currentPage, pageSize, _source_include: _sourceIncludes, type, context }),
    cmsHierarchies: (_, { filter, currentPage, pageSize, _sourceIncludes, type = 'cms_hierarchy' }, context) =>
      list({ filter, currentPage, pageSize, _source_include: _sourceIncludes, type, context })
  }
};

export default resolver;
