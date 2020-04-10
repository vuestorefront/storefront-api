import config from 'config'
import { getCurrentStoreCode } from '@storefront-api/lib/util'
import Logger from '@storefront-api/lib/logger'

/**
 * Adjust the config provided to the current store selected via request params
 * @param Object config configuration
 * @param Express request req
 */
export function multiStoreConfig (apiConfig, req) {
  let confCopy = Object.assign({}, apiConfig)
  let storeCode = getCurrentStoreCode(req)

  const availableStores = config.get<string[]>('availableStores')
  const magento2Config = config.get<Record<string, any>>('magento2')

  if (storeCode && availableStores.indexOf(storeCode) >= 0) {
    if (magento2Config['api_' + storeCode]) {
      confCopy = Object.assign({}, magento2Config['api_' + storeCode]) // we're to use the specific api configuration - maybe even separate magento instance
    }
    confCopy.url = confCopy.url + '/' + storeCode
  } else {
    if (storeCode) {
      Logger.error('Unavailable store code', storeCode)
    }
  }

  return confCopy
}
