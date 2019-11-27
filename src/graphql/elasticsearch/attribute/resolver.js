import config from 'config';
import client from '../client';
import { buildQuery } from '../queryBuilder';
import { getIndexName } from '../mapping'

async function listAttributes ({ attributes, filter, context, rootValue, _sourceInclude, _sourceExclude }) {
  let query = buildQuery({ filter: filter || attributes, pageSize: 150, type: 'attribute' });

  const response = await client.search({
    index: getIndexName(context.req.url),
    type: config.elasticsearch.indexTypes[3],
    body: query,
    _source_include: _sourceInclude,
    _source_exclude: _sourceExclude
  });

  response.items = []
  response.total_count = response.hits.total
  response.hits.hits.forEach(hit => {
    let item = hit._source
    item._score = hit._score
    response.items.push(item)
  });

  return response;
}

export async function listSingleAttribute ({ attribute_id, attribute_code, context, rootValue, _sourceInclude, _sourceExclude }) {
  const filter = {}
  if (attribute_id) filter['attribute_id'] = { eq: attribute_id }
  if (attribute_code) filter['attribute_code'] = { eq: attribute_code }
  const attrList = await listAttributes({ filter, context, rootValue, _sourceInclude, _sourceExclude })
  if (attrList && attrList.items.length > 0) {
    return attrList.items[0]
  } else {
    return null
  }
}

const resolver = {
  Query: {
    customAttributeMetadata: (_, { attributes, _sourceInclude, _sourceExclude }, context, rootValue) => listAttributes({ attributes, context, rootValue, _sourceInclude, _sourceExclude }),
    attribute: (_, { attribute_id, attribute_code, _sourceInclude, _sourceExclude }, context, rootValue) => listSingleAttribute({ attribute_id, attribute_code, _sourceInclude, _sourceExclude, context, rootValue })
  }
};

export default resolver;
