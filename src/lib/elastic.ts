import { Client as Client7, ClientOptions } from 'es7';
import { Client as Client6 } from 'es6';
import { Client as Client5, ClientOptions as ClientOptions5 } from 'es5';
import es, { Client, RequestParams } from '@elastic/elasticsearch'
import semver from 'semver';
import _ from 'lodash'
import path from 'path'
import fs from 'fs'
import jsonFile from 'jsonfile'
import { IConfig } from 'config';

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

export function adjustIndexName (indexName: string|string[], entityType: string, config: IConfig) {
  const realIndexName = Array.isArray(indexName) ? indexName[0] : indexName;

  if (semver.major(config.get<string>('elasticsearch.apiVersion')) < 6) {
    return realIndexName
  } else {
    return `${realIndexName}_${entityType}`
  }
}

export function adjustBackendProxyUrl (req, indexName: string, entityType: string, config: IConfig) {
  let url
  if (semver.major(config.get<string>('elasticsearch.apiVersion')) < 6) { // legacy for ES 5
    url = config.get<string>('elasticsearch.host') + ':' + config.get<number>('elasticsearch.port') + (req.query.request ? _updateQueryStringParameter(req.url, 'request', null) : req.url)
  } else {
    const queryString = require('query-string');
    const parsedQuery = queryString.parseUrl(req.url).query
    parsedQuery._source_includes = parsedQuery._source_include
    parsedQuery._source_excludes = parsedQuery._source_exclude
    delete parsedQuery._source_exclude
    delete parsedQuery._source_include
    delete parsedQuery.request
    url = config.get<string>('elasticsearch.host') + ':' + config.get<number>('elasticsearch.port') + '/' + adjustIndexName(indexName, entityType, config) + '/_search?' + queryString.stringify(parsedQuery)
  }
  if (!url.startsWith('http')) {
    url = config.get<string>('elasticsearch.protocol') + '://' + url
  }
  return url
}

export function adjustQuery (esQuery: RequestParams.Search, entityType: string, config: IConfig) {
  if (semver.major(config.get<string>('elasticsearch.apiVersion')) < 6) {
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

export function getClient (config: IConfig): Client|Client7|Client6|Client5 {
  const esConfig: ClientOptions = { // as we're runing tax calculation and other data, we need a ES indexer
    node: `${config.get<string>('elasticsearch.protocol')}://${config.get<string>('elasticsearch.host')}:${config.get<number>('elasticsearch.port')}`,
    requestTimeout: 5000
  }
  if (config.get<string>('elasticsearch.user')) {
    esConfig.auth = {
      username: config.get<string>('elasticsearch.user'),
      password: config.get<string>('elasticsearch.password')
    }
  }
  switch (semver.major(config.get<string>('elasticsearch.apiVersion'))) {
    case 7:
      return new Client7(esConfig);
    case 6:
      return new Client6(esConfig);
    case 5:
      let node = `${config.get<string>('elasticsearch.protocol')}://${config.get<string>('elasticsearch.host')}:${config.get<number>('elasticsearch.port')}`
      if (config.has('elasticsearch.user')) {
        node = `${config.get<string>('elasticsearch.protocol')}://${config.get<string>('elasticsearch.user')}:${config.get<string>('elasticsearch.password')}@${config.get<string>('elasticsearch.host')}:${config.get<number>('elasticsearch.port')}`
      }
      const esConfig5: ClientOptions5 = {
        node,
        requestTimeout: 5000
      }
      return new Client5(esConfig5);
    default:
      return new es.Client(esConfig)
  }
}

export function putAlias (db: Client|Client7|Client6|Client5, originalName: string, aliasName: string, next) {
  let step2 = () => {
    db.indices.putAlias({ index: originalName, name: aliasName }).then(_ => {
      console.log('Index alias created')
    }).then(next).catch(err => {
      console.log(err.message)
      next()
    })
  }
  return db.indices.deleteAlias({
    index: aliasName,
    name: originalName
  }).then((_) => {
    console.log('Public index alias deleted')
    step2()
  }).catch((err) => {
    console.log('Public index alias does not exists', err.message)
    step2()
  })
}

export function search (db: Client|Client7|Client6|Client5, query: RequestParams.Search) {
  return db.search(query)
}

export function deleteIndex (db: Client|Client7|Client6|Client5, indexName: string, next) {
  db.indices.delete({
    'index': indexName
  }).then((_) => {
    next()
  }).catch(_ => {
    return db.indices.deleteAlias({
      index: '*',
      name: indexName
    }).then((_) => {
      console.log('Public index alias deleted')
      next()
    }).catch((err) => {
      console.log('Public index alias does not exists', err.message)
      next()
    })
  })
}

export function reIndex (db: Client|Client7|Client6|Client5, fromIndexName: string, toIndexName: string, next) {
  db.reindex({
    // @ts-ignore
    wait_for_completion: true,
    waitForCompletion: true,
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

export function createIndex (db: Client|Client7|Client6|Client5, indexName: string, indexSchema: any, next) {
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
        console.error(err)
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
        console.error(err)
        next(err)
      })
    })
  }

  return db.indices.deleteAlias({
    index: '*',
    name: indexName
  }).then((_) => {
    console.log('Public index alias deleted')
    step2()
  }).catch((err) => {
    console.log('Public index alias does not exists', err.message)
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
  loadSchema
}
