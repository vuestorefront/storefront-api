import { apiStatus } from '@storefront-api/lib/util'
import { Router } from 'express'
import { version } from '../../../../package.json'
import { ExtensionAPIFunction, ExtensionAPIFunctionParameter } from '@storefront-api/lib/module';

/**
 * Here you can see an other way to export it
 *
 * const api: ExtensionAPIFunction = ({ config, db }) => {
 * let cartApi = Router();
 * cartApi.get('/version', (req, res) => {
 *  apiStatus(res, { version }, 200);
 * });
 * return cartApi;
}* }
 * export default api
 */

export default ({ config, db }: ExtensionAPIFunctionParameter) => {
  let cartApi = Router();
  cartApi.get('/version', (req, res) => {
    apiStatus(res, { version }, 200);
  });
  return cartApi;
}
