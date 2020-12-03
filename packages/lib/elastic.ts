import _ from 'lodash'
import path from 'path'
import fs from 'fs'
import jsonFile from 'jsonfile'
import querystring from 'querystring'
import { Client } from '@elastic/elasticsearch'
import { IConfig } from 'config'
import Logger from '@storefront-api/lib/logger'

function adjustIndexName (indexName: string, entityType: string, config: IConfig): string {
  if (parseInt(config.get<string>('elasticsearch.apiVersion')) < 6) {
    return indexName
  } else {
    return `${indexName}_${entityType}`
  }
}

function decorateBackendUrl (entityType, url, req, config) {
  const {
    useRequestFilter,
    requestParamsBlacklist,
    overwriteRequestSourceParams,
    apiVersion
  } = config.elasticsearch

  if (useRequestFilter && typeof config.entities[entityType] === 'object') {
    const urlParts = url.split('?')
    const { includeFields, excludeFields } = config.entities[entityType]

    const filteredParams = Object.keys(req.query)
      .filter(key => !requestParamsBlacklist.includes(key))
      .reduce((object, key) => {
        object[key] = req.query[key]
        return object
      }, {})

    let _source_include = includeFields || []
    let _source_exclude = excludeFields || []

    if (!overwriteRequestSourceParams) {
      const requestSourceInclude = req.query._source_include || []
      const requestSourceExclude = req.query._source_exclude || []
      _source_include = [...includeFields, ...requestSourceInclude]
      _source_exclude = [...excludeFields, ...requestSourceExclude]
    }

    const isEs6AndUp = (parseInt(apiVersion) >= 6)
    const _sourceIncludeKey = isEs6AndUp ? '_source_includes' : '_source_include'
    const _sourceExcludeKey = isEs6AndUp ? '_source_excludes' : '_source_exclude'

    const urlParams = {
      ...filteredParams,
      [_sourceIncludeKey]: _source_include,
      [_sourceExcludeKey]: _source_exclude
    }
    url = `${urlParts[0]}?${querystring.stringify(urlParams)}`
  }

  return url
}

function adjustQueryParams (query, entityType, config) {
  delete query.request
  delete query.request_format
  delete query.response_format

  const {
    apiVersion,
    useRequestFilter,
    overwriteRequestSourceParams,
    requestParamsBlacklist,
    cacheRequest
  } = config.elasticsearch

  if (useRequestFilter && !overwriteRequestSourceParams && typeof config.entities[entityType] === 'object') {
    const { includeFields, excludeFields } = config.entities[entityType]
    const requestSourceInclude = query._source_include ? query._source_include.split(',') : []
    const requestSourceExclude = query._source_exclude ? query._source_exclude.split(',') : []
    query._source_include = [...includeFields, ...requestSourceInclude]
    query._source_exclude = [...excludeFields, ...requestSourceExclude]
  }

  if (parseInt(apiVersion) >= 6) { // legacy for ES 5
    query._source_includes = query._source_include
    query._source_excludes = query._source_exclude
    delete query._source_exclude
    delete query._source_include
    if (cacheRequest) {
      query.request_cache = !!cacheRequest
    }
  }

  if (useRequestFilter && typeof config.entities[entityType] === 'object') {
    query = Object.keys(query)
      .filter(key => !requestParamsBlacklist.includes(key))
      .reduce((object, key) => {
        object[key] = query[key]
        return object
      }, {})
  }

  return query
}

function adjustBackendProxyUrl (req, indexName, entityType, config) {
  let url
  const queryString = require('query-string');
  const parsedQuery = adjustQueryParams(queryString.parseUrl(req.url).query, entityType, config)

  if (parseInt(config.elasticsearch.apiVersion) < 6) { // legacy for ES 5
    url = config.elasticsearch.host + ':' + config.elasticsearch.port + '/' + indexName + '/' + entityType + '/_search?' + queryString.stringify(parsedQuery)
  } else {
    url = config.elasticsearch.host + ':' + config.elasticsearch.port + '/' + adjustIndexName(indexName, entityType, config) + '/_search?' + queryString.stringify(parsedQuery)
  }

  if (!url.startsWith('http')) {
    url = config.elasticsearch.protocol + '://' + url
  }

  return decorateBackendUrl(entityType, url, req, config)
}

/**
 * Similar to `adjustBackendProxyUrl`, builds multi-entity query url
 */
function buildMultiEntityUrl ({ config, includeFields = [], excludeFields = [] }: { config: IConfig, includeFields: string[], excludeFields: string[] }) {
  let url = `${config.get('elasticsearch.host')}:${config.get('elasticsearch.port')}/_search?_source_includes=${includeFields.join(',')}&_source_excludes=${excludeFields.join(',')}`
  if (!url.startsWith('http')) {
    url = config.get('elasticsearch.protocol') + '://' + url
  }
  return url
}

function adjustQuery (esQuery, entityType, config) {
  if (parseInt(config.elasticsearch.apiVersion) < 6) {
    esQuery.type = entityType
  } else {
    delete esQuery.type
  }

  esQuery.index = adjustIndexName(esQuery.index, entityType, config)
  return esQuery
}

function getHits (result) {
  if (result.body) { // differences between ES5 and ES7
    return result.body.hits.hits
  } else {
    return result.hits.hits
  }
}

/**
 * Support for ES7+ where the `total` now is an object
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/breaking-changes-7.0.html
 */
const getTotals = body => typeof body.hits.total === 'object' ? body.hits.total.value : body.hits.total

let esClient = null
function getClient (config) {
  if (esClient) {
    return esClient
  }

  const { host, port, protocol, requestTimeout, pingTimeout } = config.elasticsearch

  const nodes = []
  const hosts = typeof host === 'string' ? host.split(',') : host

  hosts.forEach(host => {
    const node = `${protocol}://${host}:${port}`
    nodes.push(node)
  })

  let auth
  if (config.elasticsearch.user) {
    const { user, password } = config.elasticsearch
    auth = { username: user, password }
  }

  esClient = new Client({ nodes, auth, requestTimeout, pingTimeout })

  return esClient
}

function putAlias (db, originalName, aliasName, next) {
  const step2 = () => {
    db.indices.putAlias({ index: originalName, name: aliasName }).then(() => {
      console.log('Index alias created')
    }).then(next).catch(err => {
      console.log(err.message)
      next()
    })
  }
  return db.indices.deleteAlias({
    index: aliasName,
    name: originalName
  }).then(() => {
    console.log('Public index alias deleted')
    step2()
  }).catch((err) => {
    console.log('Public index alias does not exists', err.message)
    step2()
  })
}

function search (db, query) {
  return db.search(query)
}

function deleteIndex (db, indexName, next) {
  db.indices.delete({
    index: indexName
  }).then(() => {
    next()
  }).catch(err => {
    if (err) {
      console.error(err)
    }
    return db.indices.deleteAlias({
      index: '*',
      name: indexName
    }).then(() => {
      console.log('Public index alias deleted')
      next()
    }).catch((err) => {
      console.log('Public index alias does not exists', err.message)
      next()
    })
  })
}

function reIndex (db, fromIndexName, toIndexName, next) {
  db.reindex({
    wait_for_completion: true,
    waitForCompletion: true,
    body: {
      source: {
        index: fromIndexName
      },
      dest: {
        index: toIndexName
      }
    }
  }).then(() => {
    next()
  }).catch(err => {
    next(err)
  })
}

/**
 * Load the schema definition for particular entity type
 * @param {String} rootPath
 * @param {String} entityType
 * @param {String} apiVersion
 */
function loadSchema (rootPath: string, entityType: string, apiVersion = '7.1') {
  const rootSchemaPath = path.join(rootPath, 'elastic.schema.' + entityType + '.json')
  if (!fs.existsSync(rootSchemaPath)) {
    return null
  }
  let schemaContent = jsonFile.readFileSync(rootSchemaPath)
  let elasticSchema = parseInt(apiVersion) < 6 ? schemaContent : Object.assign({}, { mappings: schemaContent });
  const extensionsPath = path.join(__dirname, 'elastic.schema.' + entityType + '.extension.json');
  if (fs.existsSync(extensionsPath)) {
    schemaContent = jsonFile.readFileSync(extensionsPath)
    const elasticSchemaExtensions = parseInt(apiVersion) < 6 ? schemaContent : Object.assign({}, { mappings: schemaContent });
    elasticSchema = _.merge(elasticSchema, elasticSchemaExtensions) // user extensions
  }
  return elasticSchema
}

async function createIndex<T = any> (db: Client, indexName: string, indexSchema: T): Promise<void> {
  try {
    await db.indices.deleteAlias({
      index: '*',
      name: indexName
    })
    Logger.info('Public index alias deleted')
  } catch (err) {
    Logger.info('Public index alias does not exists', err.message)
  } finally {
    try {
      await db.indices.delete({ index: indexName })
      Logger.info('Public index deleted')
    } catch (err) {
      Logger.info('Public index does not exists', err.message)
    } finally {
      await db.indices.create({
        index: indexName,
        body: indexSchema
      })
      Logger.info('Public index has been created')
    }
  }
}

export {
  putAlias,
  createIndex,
  deleteIndex,
  reIndex,
  search,
  adjustQuery,
  adjustQueryParams,
  adjustBackendProxyUrl,
  getClient,
  getHits,
  getTotals,
  adjustIndexName,
  loadSchema,
  buildMultiEntityUrl
}
