import config from 'config'

export function getIndexName (url) {
  const parseURL = url.replace(/^\/+|\/+$/g, '');
  let urlParts = parseURL.split('/');
  let esIndex = config.get('elasticsearch.indices')[0]

  if (urlParts.length >= 1 && urlParts[0] !== '' && urlParts[0] !== '?') {
    esIndex = config.get('storeViews')[urlParts[0]].elasticsearch.index
  }

  return esIndex
}

export default function getMapping (attribute, entityType = 'product') {
  let mapping = [
  ]

  if (typeof config.get('entities')[entityType].filterFieldMapping !== 'undefined') {
    mapping = config.get('entities')[entityType].filterFieldMapping
  }

  if (typeof mapping[attribute] !== 'undefined') {
    return mapping[attribute]
  }

  return attribute
}
