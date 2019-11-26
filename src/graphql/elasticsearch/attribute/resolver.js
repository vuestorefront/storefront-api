import config from 'config';
import client from '../client';
import { buildQuery } from '../queryBuilder';
import { getIndexName } from '../mapping'

async function listAttributes (attributes, context, rootValue, _sourceInclude, _sourceExclude) {
  let query = buildQuery({ filter: attributes, pageSize: 150, type: 'attribute' });

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

const resolver = {
  Query: {
    customAttributeMetadata: (_, { attributes, _sourceInclude, _sourceExclude }, context, rootValue) => listAttributes(attributes, context, rootValue, _sourceInclude, _sourceExclude)
  }
};

export default resolver;
