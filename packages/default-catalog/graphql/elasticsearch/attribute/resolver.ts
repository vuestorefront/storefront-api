import config from 'config';
import client from '../client';
import { buildQuery } from '../queryBuilder';
import { getIndexName } from '../mapping'
import { adjustQuery, getResponseObject } from '@storefront-api/lib/elastic'

async function listAttributes ({ attributes = null, filter = null, context, rootValue, _sourceIncludes, _sourceExcludes }) {
  let query = buildQuery({ filter: filter || attributes, pageSize: 150, type: 'attribute' });

  const esQuery = {
    index: getIndexName(context.req.url),
    body: query,
    _source_includes: _sourceIncludes,
    _source_excludes: _sourceExcludes
  }

  const response = getResponseObject(await client.search(adjustQuery(esQuery, 'attribute', config)));

  response.items = []
  response.total_count = response.hits.total
  response.hits.hits.forEach(hit => {
    let item = hit._source
    item._score = hit._score
    response.items.push(item)
  });
  return response;
}

export async function listSingleAttribute ({ attribute_id, attribute_code, context, rootValue, _sourceIncludes, _sourceExcludes }) {
  const filter = {}
  if (attribute_id) filter['attribute_id'] = { eq: attribute_id }
  if (attribute_code) filter['attribute_code'] = { eq: attribute_code }
  const attrList = await listAttributes({ filter, context, rootValue, _sourceIncludes, _sourceExcludes })
  if (attrList && attrList.items.length > 0) {
    return attrList.items[0]
  } else {
    return null
  }
}

const resolver = {
  Query: {
    customAttributeMetadata: (_, { attributes, _sourceIncludes, _sourceExcludes }, context, rootValue) => listAttributes({ attributes, context, rootValue, _sourceIncludes, _sourceExcludes }),
    attribute: (_, { attribute_id, attribute_code, _sourceIncludes, _sourceExcludes }, context, rootValue) => listSingleAttribute({ attribute_id, attribute_code, _sourceIncludes, _sourceExcludes, context, rootValue })
  }
};

export default resolver;
