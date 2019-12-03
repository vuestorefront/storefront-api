import config from 'config';
import client from '../client';
import { buildQuery } from '../queryBuilder';
import { getIndexName } from '../mapping'
import { adjustQuery, getResponseObject } from '../../../../../lib/elastic'

async function list ({ filter, currentPage, pageSize = 200, context, _sourceInclude, type }) {
  let query = buildQuery({ filter, currentPage, pageSize, _sourceInclude, type });

  const response = getResponseObject(await client.search(adjustQuery({
    index: getIndexName(context.req.url),
    body: query,
    _sourceInclude
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
    cmsPages: (_, { filter, currentPage, pageSize, _sourceInclude, type = 'cms_page' }, context) =>
      list({ filter, currentPage, pageSize, _sourceInclude, type, context }),
    cmsBlocks: (_, { filter, currentPage, pageSize, _sourceInclude, type = 'cms_block' }, context) =>
      list({ filter, currentPage, pageSize, _sourceInclude, type, context }),
    cmsHierarchies: (_, { filter, currentPage, pageSize, _sourceInclude, type = 'cms_hierarchy' }, context) =>
      list({ filter, currentPage, pageSize, _sourceInclude, type, context })
  }
};

export default resolver;
