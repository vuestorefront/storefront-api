import { Request } from 'express';
import { IConfig } from 'config';

class AbstractWishlistProxy {
  protected _request: Request
  protected _config: IConfig
  public api: Record<string, Record<string, Function>>

  protected constructor (config, req) {
    this._config = config
    this._request = req
  }

  public pull (customerToken): Promise<any> {
    throw new Error('AbstractWishlistProxy::pull must be implemented for specific platform')
  }
  public update (customerToken, wishListItem): Promise<any> {
    throw new Error('AbstractWishlistProxy::update must be implemented for specific platform')
  }
  public delete (customerToken, wishListItem) {
    throw new Error('AbstractWishlistProxy::delete must be implemented for specific platform')
  }
}

export default AbstractWishlistProxy
