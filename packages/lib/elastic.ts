import { Client, RequestParams, ClientOptions } from '@elastic/elasticsearch'
import semver from 'semver';
import _ from 'lodash'
import path from 'path'
import fs from 'fs'
import jsonFile from 'jsonfile'
import { IConfig } from 'config';
import Logger from '@storefront-api/lib/logger'

function _updateQueryStringParameter (uri: string, key: string|number, value: string|number) {
  const regExp = new RegExp('([?&])' + key + '=.*?(&|#|$)', 'i');
  if (uri.match(regExp)) {
    if (value) {
      return uri.replace(regExp, '$1' + key + '=' + value + '$2');
    } else {
      return uri.replace(regExp, '$1' + '$2');
    }
  } else {
    let hash = '';
    if (uri.indexOf('#') !== -1) {
      hash = uri.replace(/.*#/, '#');
      uri = uri.replace(/#.*/, '');
    }
    const separator = uri.indexOf('?') !== -1 ? '&' : '?';
    return uri + separator + key + '=' + value + hash;
  }
}

/**
 * similar to `adjustBackendProxyUrl`, builds multi-entity query url
 */
export function buildMultiEntityUrl ({ config, includeFields = [], excludeFields = [] }: { config: IConfig, includeFields: string[], excludeFields: string[] }) {
  let url = `${config.get('elasticsearch.host')}:${config.get('elasticsearch.port')}/_search?_source_includes=${includeFields.join(',')}&_source_excludes=${excludeFields.join(',')}`
  if (!url.startsWith('http')) {
    url = config.get('elasticsearch.protocol') + '://' + url
  }
  return url
}

export function adjustIndexName (indexName: string|string[], entityType: string, config: IConfig) {
  const realIndexName = Array.isArray(indexName) ? indexName[0] : indexName;

  if (semver.major(semver.coerce(config.get<string>('elasticsearch.apiVersion'))) < 6) {
    return realIndexName
  } else {
    return `${realIndexName}_${entityType}`
  }
}

export function adjustBackendProxyUrl (req, indexName: string, entityType: string, config: IConfig) {
  let url
  const queryString = require('query-string');
  const parsedQuery = queryString.parseUrl(req.url).query

  if (semver.major(semver.coerce(config.get<string>('elasticsearch.apiVersion'))) < 6) { // legacy for ES 5
    delete parsedQuery.request
    delete parsedQuery.request_format
    delete parsedQuery.response_format
    url = config.get<string>('elasticsearch.host') + ':' + config.get<string>('elasticsearch.port') + '/' + indexName + '/' + entityType + '/_search?' + queryString.stringify(parsedQuery)
  } else {
    parsedQuery._source_includes = parsedQuery._source_include
    parsedQuery._source_excludes = parsedQuery._source_exclude
    delete parsedQuery._source_exclude
    delete parsedQuery._source_include
    delete parsedQuery.request
    delete parsedQuery.request_format
    delete parsedQuery.response_format
    if (config.get<boolean>('elasticsearch.cacheRequest')) {
      parsedQuery.request_cache = !!config.get<boolean>('elasticsearch.cacheRequest')
    }
    url = config.get<string>('elasticsearch.host') + ':' + config.get<number>('elasticsearch.port') + '/' + adjustIndexName(indexName, entityType, config) + '/_search?' + queryString.stringify(parsedQuery)
  }
  if (!url.startsWith('http')) {
    url = config.get<string>('elasticsearch.protocol') + '://' + url
  }
  return url
}

export function adjustQuery (esQuery: RequestParams.Search, entityType: string, config: IConfig) {
  if (semver.major(semver.coerce(config.get<string>('elasticsearch.apiVersion'))) < 6) {
    esQuery.type = entityType
  } else {
    delete esQuery.type
  }
  esQuery.index = adjustIndexName(esQuery.index, entityType, config)
  return esQuery
}

export function getResponseObject (result) {
  if (result.body) { // differences between ES5 andd ES7
    return result.body
  } else {
    return result
  }
}

export function getHits (result) {
  if (result.body) { // differences between ES5 andd ES7
    return result.body.hits.hits
  } else {
    return result.hits.hits
  }
}

let esClient = null
export function getClient (config: IConfig): Client {
  const { host, port, protocol, requestTimeout } = config.get('elasticsearch')
  const node = `${protocol}://${host}:${port}`

  let auth

  if (config.has('elasticsearch.user')) {
    const { user, password } = config.get('elasticsearch')
    auth = { username: user, password }
  }

  if (!esClient) {
    esClient = new Client({ node, auth, requestTimeout })
  }

  return esClient
}

export async function putAlias (db: Client, originalName: string, aliasName: string) {
  try {
    await db.indices.deleteAlias({
      index: aliasName,
      name: originalName
    })
    Logger.info('Public index alias deleted')
  } catch (err) {
    Logger.info('Public index alias does not exists', err.message)
  } finally {
    try {
      await db.indices.putAlias({ index: originalName, name: aliasName })
      Logger.info('Index alias created')
    } catch (err) {
      Logger.info(err.message)
    }
  }
}

export function search (db: Client, query: RequestParams.Search) {
  return db.search(query)
}

export async function deleteIndex (db: Client, indexName: string) {
  try {
    await db.indices.delete({ index: indexName })
    Logger.info('Public index deleted')
  } catch (err) {
    Logger.info('Public index does not exists', err.message)
    try {
      await db.indices.deleteAlias({
        index: '*',
        name: indexName
      })
      Logger.info('Public index alias deleted')
    } catch (err) {
      Logger.info('Public index alias does not exists', err.message)
    }
  }
}

export async function reIndex (db: Client, fromIndexName: string, toIndexName: string) {
  try {
    db.reindex({
      wait_for_completion: true,
      body: {
        source: {
          index: fromIndexName
        },
        dest: {
          index: toIndexName
        }
      }
    })
  } catch (err) {
    Logger.info('Reindex failed with message', err.message)
  }
}

export async function createIndex<T = any> (db: Client, indexName: string, indexSchema: T) {
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

/**
 * Load the schema definition for particular entity type
 * @param {String} rootPath
 * @param {String} entityType
 * @param {String} apiVersion
 */
export function loadSchema (rootPath: string, entityType: string, apiVersion = '7.1') {
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

export default {
  putAlias,
  createIndex,
  deleteIndex,
  reIndex,
  search,
  adjustQuery,
  adjustBackendProxyUrl,
  getClient,
  getHits,
  getResponseObject,
  adjustIndexName,
  loadSchema,
  buildMultiEntityUrl
}
