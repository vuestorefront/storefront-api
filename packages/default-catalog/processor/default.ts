import {Request, Response} from 'express';
import {IConfig} from 'config';

const jwa = require('jwa');
const hmac = jwa('HS256');

export abstract class ProcessorAbstract {
  protected _config: IConfig
  protected _entityType: any
  protected _indexName: any
  protected _req: Request
  protected _res: Response

  public constructor (config, entityType, indexName, req, res) {
    this._config = config
    this._entityType = entityType
    this._indexName = indexName
    this._req = req
    this._res = res
  }

  public abstract process(items: any[], args?: any): Promise<any[]>
}

export default class HmacProcessor extends ProcessorAbstract {
  public process (items): Promise<any[]> {
    const processorChain = []
    return new Promise((resolve, reject) => {
      const rs = items.map((item) => {
        if (this._req.query._source_exclude && (this._req.query._source_exclude as string).indexOf('sgn') < 0) {
          item._source.sgn = hmac.sign(item._source, this._config.get('objHashSecret')); // for products we sign off only price and id becase only such data is getting back with orders
        }
        return item
      })

      // return first resultSet
      resolve(rs)
    })
  }
}
