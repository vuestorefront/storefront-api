import { getClient as esClient, adjustQuery, adjustQueryParams, getTotals } from '@storefront-api/lib/elastic'
import { elasticsearch, SearchQuery, ElasticsearchQueryConfig } from 'storefront-query-builder'
import { apiError } from '@storefront-api/lib/util'
import { Router, Request, Response } from 'express'
import { ExtensionAPIFunctionParameter } from '@storefront-api/lib/module'
import cache from '@storefront-api/lib/cache-instance'
import Logger from '@storefront-api/lib/logger'
import AttributeService from './attribute/service'
import ProcessorFactory from '../processor/factory'
import loadCustomFilters from '../helper/loadCustomFilters'
import { sha3_224 } from 'js-sha3'

import { IConfig } from 'config'
import bodybuilder from 'bodybuilder'
import jwt from 'jwt-simple'

async function _cacheStorageHandler (config: IConfig, result: Record<string, any>, hash: string, tags = []): Promise<void> {
  if (config.get<boolean>('server.useOutputCache') && cache) {
    return cache.set(
      'api:' + hash,
      result,
      tags
    ).catch((err) => {
      Logger.error(err)
    })
  }
}

function _outputFormatter (responseBody: Record<string, any>, format = 'standard'): Record<string, any> {
  if (format === 'compact') { // simple formatter
    delete responseBody.took
    delete responseBody.timed_out
    delete responseBody._shards
    if (responseBody.hits) {
      delete responseBody.hits.max_score
      responseBody.total = getTotals(responseBody)
      responseBody.hits = responseBody.hits.hits.map(hit => {
        return Object.assign(hit._source, { _score: hit._score })
      })
    }
  }
  return responseBody
}

export default ({ config }: ExtensionAPIFunctionParameter) => async function (req: Request, res: Response): Promise<void | Router> {
  let groupId = null

  // Request method handling: exit if not GET or POST
  // Other methods - like PUT, DELETE etc. should be available only for authorized users or not available at all)
  if (!(req.method === 'GET' || req.method === 'POST' || req.method === 'OPTIONS')) {
    throw new Error('ERROR: ' + req.method + ' request method is not supported.')
  }

  let responseFormat = 'standard'
  let requestBody = req.body
  if (req.method === 'GET') {
    if (req.query.request) { // this is in fact optional
      try {
        requestBody = JSON.parse(decodeURIComponent(req.query.request as string))
      } catch (err) {
        throw new Error(err)
      }
    }
  }

  if (req.query.request_format === 'search-query') { // search query and not Elastic DSL - we need to translate it
    const customFilters = await loadCustomFilters(config)
    requestBody = await elasticsearch.buildQueryBodyFromSearchQuery({ config: config as ElasticsearchQueryConfig, queryChain: bodybuilder(), searchQuery: new SearchQuery(requestBody), customFilters })
  }
  if (req.query.response_format) responseFormat = req.query.response_format as string

  const urlSegments = req.url.split('/')

  let indexName = ''
  let entityType = ''
  if (urlSegments.length < 2) { throw new Error('No index name given in the URL. Please do use following URL format: /api/catalog/<index_name>/<entity_type>_search') } else {
    indexName = urlSegments[1]

    if (urlSegments.length > 2) { entityType = urlSegments[2] }

    if (config.get<string[]>('elasticsearch.indices').indexOf(indexName) < 0) {
      throw new Error('Invalid / inaccessible index name given in the URL. Please do use following URL format: /api/catalog/<index_name>/_search')
    }

    if (urlSegments[urlSegments.length - 1].indexOf('_search') !== 0) {
      throw new Error('Please do use following URL format: /api/catalog/<index_name>/_search')
    }
  }

  // Decode token and get group id
  const userToken = requestBody.groupToken
  if (userToken && userToken.length > 10) {
    /**
     * We need to use try catch so when we change the keys for encryption that not every request with a loggedin user
     * fails with a 500 at this point.
     **/
    try {
      const decodeToken = jwt.decode(userToken, config.get<string>('authHashSecret') ? config.get<string>('authHashSecret') : config.get<string>('objHashSecret'))
      groupId = decodeToken.group_id || groupId
    } catch (err) {}
  } else if (requestBody.groupId) {
    groupId = requestBody.groupId || groupId
  }

  delete requestBody.groupToken
  delete requestBody.groupId

  const s = Date.now()
  const reqHash = sha3_224(`${JSON.stringify(requestBody)}${req.url}`)
  const dynamicRequestHandler = () => {
    const reqQuery = Object.assign({}, req.query)
    const reqQueryParams = adjustQueryParams(reqQuery, entityType, config)

    const query = adjustQuery({
      index: indexName,
      method: req.method,
      body: requestBody
    }, entityType, config)

    esClient(config)
      .search(Object.assign(query, reqQueryParams))
      .then(async response => {
        let { body: _resBody } = response

        if (_resBody.error) {
          Logger.error('An error occured during catalog request:', _resBody.error)
          apiError(res, _resBody.error)
          return
        }

        try {
          if (_resBody && _resBody.hits && _resBody.hits.hits) { // we're signing up all objects returned to the client to be able to validate them when (for example order)
            const factory = new ProcessorFactory(config)
            const tagsArray = []
            if (config.get<boolean>('server.useOutputCache') && cache) {
              const tagPrefix = entityType[0].toUpperCase() // first letter of entity name: P, T, A ...
              tagsArray.push(entityType)
              _resBody.hits.hits.map(item => {
                if (item._source.id) { // has common identifier
                  tagsArray.push(`${tagPrefix}${item._source.id}`)
                }
              })

              const cacheTags = tagsArray.join(' ')
              res.setHeader('X-VS-Cache-Tags', cacheTags)
            }

            let resultProcessor = factory.getAdapter(entityType, indexName, req, res)

            if (!resultProcessor) { resultProcessor = factory.getAdapter('default', indexName, req, res) } // get the default processor

            const productGroupId = entityType === 'product' ? groupId : undefined
            const result = await resultProcessor.process(_resBody.hits.hits, productGroupId)
            _resBody.hits.hits = result
            if (entityType === 'product' && _resBody.aggregations && config.get<boolean>('entities.attribute.loadByAttributeMetadata')) {
              const attributeListParam = AttributeService.transformAggsToAttributeListParam(_resBody.aggregations)
              // find attribute list
              const attributeList = await AttributeService.list(attributeListParam, config, indexName)
              _resBody.attribute_metadata = attributeList.map(AttributeService.transformToMetadata)
            }

            _resBody = _outputFormatter(_resBody, responseFormat)

            _cacheStorageHandler(config, _resBody, reqHash, tagsArray)
          }

          res.json(_resBody)
        } catch (err) {
          apiError(res, err)
        }
      })
      .catch(err => {
        apiError(res, err)
      })
  }

  if (config.get<boolean>('server.useOutputCache') && cache) {
    cache.get(
      'api:' + reqHash
    ).then(output => {
      if (output !== null) {
        res.setHeader('X-VS-Cache', 'Hit')
        res.json(output)
        Logger.info(`cache hit [${req.url}], cached request: ${Date.now() - s}ms`)
      } else {
        res.setHeader('X-VS-Cache', 'Miss')
        Logger.info(`cache miss [${req.url}], request: ${Date.now() - s}ms`)
        dynamicRequestHandler()
      }
    }).catch(err => Logger.error(err))
  } else {
    dynamicRequestHandler()
  }
}
