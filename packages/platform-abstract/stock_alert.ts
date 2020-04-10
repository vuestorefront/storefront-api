import { Request } from 'express';
import { IConfig } from 'config';

class AbstractStockAlertProxy {
  protected _request: Request
  protected _config: IConfig
  public api: Record<string, Record<string, Function>>

  protected constructor (config, req) {
    this._config = config
    this._request = req
  }
  public subscribe (customerToken, productId, emailAddress): Promise<any> {
    throw new Error('AbstractContactProxy::subscribe must be implemented for specific platform')
  }
}

export default AbstractStockAlertProxy
