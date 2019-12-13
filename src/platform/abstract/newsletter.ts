import { Request } from 'express';
import { IConfig } from 'config';

class AbstractNewsletterProxy {
  private _request: Request
  private _config: IConfig

  protected constructor (config, req) {
    this._config = config
    this._request = req
  }

  public subscribe (emailAddress): Promise<any> { throw new Error('AbstractNewsletterProxy::subscribe must be implemented for specific platform') }

  public unsubscribe (customerToken): Promise<any> { throw new Error('AbstractNewsletterProxy::unsubscribe must be implemented for specific platform') }
}

export default AbstractNewsletterProxy
