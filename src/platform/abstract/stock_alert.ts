import { Request } from 'express';
import { IConfig } from 'config';

class AbstractStockAlertProxy {
  private _request: Request
  private _config: IConfig

  protected constructor (config, req) {
    this._config = config
    this._request = req
  }
  public subscribe (customerToken, productId, emailAddress): Promise<any> {
    throw new Error('AbstractContactProxy::subscribe must be implemented for specific platform')
  }
}

export default AbstractStockAlertProxy
