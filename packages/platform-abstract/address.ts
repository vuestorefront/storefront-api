import { Request } from 'express';
import { IConfig } from 'config';

class AbstractAddressProxy {
  protected _request: Request
  protected _config: IConfig
  public api: Record<string, Record<string, Function>>

  protected constructor (config, req) {
    this._config = config
    this._request = req
  }

  public list (customerToken): Promise<any> {
    throw new Error('AbstractAddressProxy::list must be implemented for specific platform')
  }
  public update (customerToken, addressData): Promise<any> {
    throw new Error('AbstractAddressProxy::update must be implemented for specific platform')
  }
  public get (customerToken, addressId): Promise<any> {
    throw new Error('AbstractAddressProxy::get must be implemented for specific platform')
  }
  public delete (customerToken, addressData): Promise<any> {
    throw new Error('AbstractAddressProxy::delete must be implemented for specific platform')
  }
}

export default AbstractAddressProxy
