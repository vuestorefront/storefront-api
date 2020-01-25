import { Router } from 'express';
import { json } from 'body-parser';
import { NextHandleFunction } from 'connect';
import { IConfig } from 'config';
import { DbContext } from '@storefront-api/lib/module/types'

export default ({ config, db }: { config: IConfig, db: DbContext }): [ NextHandleFunction, Router ] => {
  let routes: Router = Router();
  let bp: NextHandleFunction = json();
  return [ bp, routes ];
}
