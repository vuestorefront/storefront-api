import { Request } from 'express';
import { IConfig } from 'config';

class AbstractNewsletterProxy {
  private _request: Request
  private _config: IConfig

  protected constructor (config, req) {
    this._config = config
    this._request = req
  }

  public subscribe (emailAddress): Promise<any> { throw new Error('Please implement me :(') }

  public unsubscribe (customerToken): Promise<any> { throw new Error('Please implement me :(') }
}

export default AbstractNewsletterProxy
