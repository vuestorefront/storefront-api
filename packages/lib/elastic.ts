import { Client, RequestParams, ClientOptions } from '@elastic/elasticsearch'
import semver from 'semver';
import _ from 'lodash'
import path from 'path'
import fs from 'fs'
import jsonFile from 'jsonfile'
import { IConfig } from 'config';
import Logger from '@storefront-api/lib/logger'

function _updateQueryStringParameter (uri: string, key: string|number, value: string|number) {
  let re = new RegExp('([?&])' + key + '=.*?(&|#|$)', 'i');
  if (uri.match(re)) {
    if (value) {
      return uri.replace(re, '$1' + key + '=' + value + '$2');
    } else {
      return uri.replace(re, '$1' + '$2');
    }
  } else {
    let hash = '';
    if (uri.indexOf('#') !== -1) {
      hash = uri.replace(/.*#/, '#');
      uri = uri.replace(/#.*/, '');
    }
    let separator = uri.indexOf('?') !== -1 ? '&' : '?';
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

export function getClient (config: IConfig): Client {
  let { host, port, protocol, requestTimeout } = config.get('elasticsearch')
  const node = `${protocol}://${host}:${port}`

  let auth

  if (config.has('elasticsearch.user')) {
    const { user, password } = config.get('elasticsearch')
    auth = { username: user, password }
  }

  return new Client({ node, auth, requestTimeout })
}

export function putAlias (db: Client, originalName: string, aliasName: string, next) {
  let step2 = () => {
    db.indices.putAlias({ index: originalName, name: aliasName }).then(_ => {
      Logger.info('Index alias created')
    }).then(next).catch(err => {
      Logger.info(err.message)
      next()
    })
  }
  return db.indices.deleteAlias({
    index: aliasName,
    name: originalName
  }).then((_) => {
    Logger.info('Public index alias deleted')
    step2()
  }).catch((err) => {
    Logger.info('Public index alias does not exists', err.message)
    step2()
  })
}

export function search (db: Client, query: RequestParams.Search) {
  return db.search(query)
}

export function deleteIndex (db: Client, indexName: string, next: () => void) {
  db.indices.delete({
    'index': indexName
  }).then((_) => {
    next()
  }).catch(_ => {
    return db.indices.deleteAlias({
      index: '*',
      name: indexName
    }).then((_) => {
      Logger.info('Public index alias deleted')
      next()
    }).catch((err) => {
      Logger.info('Public index alias does not exists', err.message)
      next()
    })
  })
}

export function reIndex (db: Client, fromIndexName: string, toIndexName: string, next: (args?: Error) => void) {
  db.reindex({
    wait_for_completion: true,
    body: {
      'source': {
        'index': fromIndexName
      },
      'dest': {
        'index': toIndexName
      }
    }
  }).then(_ => {
    next()
  }).catch(err => {
    next(err)
  })
}

export function createIndex<T = any> (db: Client, indexName: string, indexSchema: T, next: (args?: Error) => void) {
  const step2 = () => {
    db.indices.delete({
      'index': indexName
    }).then(_ => {
      db.indices.create(
        {
          'index': indexName,
          'body': indexSchema
        }).then(_ => {
        next()
      }).catch(err => {
        Logger.error(err)
        next(err)
      })
    }).catch(() => {
      db.indices.create(
        {
          'index': indexName,
          'body': indexSchema
        }).then(_ => {
        next()
      }).catch(err => {
        Logger.error(err)
        next(err)
      })
    })
  }

  return db.indices.deleteAlias({
    index: '*',
    name: indexName
  }).then((_) => {
    Logger.info('Public index alias deleted')
    step2()
  }).catch((err) => {
    Logger.info('Public index alias does not exists', err.message)
    step2()
  })
}

/**
 * Load the schema definition for particular entity type
 * @param {String} rootPath
 * @param {String} entityType
 * @param {String} apiVersion
 */
export function loadSchema (rootPath: string, entityType: string, apiVersion: string = '7.1') {
  const rootSchemaPath = path.join(rootPath, 'elastic.schema.' + entityType + '.json')
  if (!fs.existsSync(rootSchemaPath)) {
    return null
  }
  let schemaContent = jsonFile.readFileSync(rootSchemaPath)
  let elasticSchema = parseInt(apiVersion) < 6 ? schemaContent : Object.assign({}, { mappings: schemaContent });
  const extensionsPath = path.join(__dirname, 'elastic.schema.' + entityType + '.extension.json');
  if (fs.existsSync(extensionsPath)) {
    schemaContent = jsonFile.readFileSync(extensionsPath)
    let elasticSchemaExtensions = parseInt(apiVersion) < 6 ? schemaContent : Object.assign({}, { mappings: schemaContent });
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
