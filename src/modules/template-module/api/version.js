import { apiStatus } from 'src/lib/util';
import { Router } from 'express';
const version = require('package.json').version

export default ({ config, db }) => {
  let cartApi = Router();
  cartApi.get('/version', (req, res) => {
    apiStatus(res, { version }, 200);
  });
  return cartApi;
};
