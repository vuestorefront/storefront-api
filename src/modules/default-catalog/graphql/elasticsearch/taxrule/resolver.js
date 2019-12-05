import config from 'config';
import client from '../client';
import { buildQuery } from '../queryBuilder';
import { getIndexName } from '../mapping'
import { adjustQuery, getResponseObject } from '../../../../../lib/elastic'

async function taxrule ({ filter, context, rootValue }) {
  let query = buildQuery({ filter, pageSize: 150, type: 'taxrule' });

  const response = getResponseObject(await client.search(adjustQuery({
    index: getIndexName(context.req.url),
    body: query
  }, 'taxrule', config)))

  // Process hits
  response.items = []
  response.hits.hits.forEach(hit => {
    let item = hit._source
    item._score = hit._score
    response.items.push(item)
  });

  response.total_count = response.hits.total
  return response;
}

const resolver = {
  Query: {
    taxrule: (_, { filter }, context, rootValue) => taxrule({ filter, context, rootValue })
  }
};

export default resolver;
