import { Request } from 'express';
import { IConfig } from 'config';

class AbstractContactProxy {
  protected _request: Request
  protected _config: IConfig
  public api: Record<string, Record<string, Function>>

  public constructor (config, req) {
    this._config = config
    this._request = req
  }

  public submit (formData): Promise<any> {
    throw new Error('AbstractContactProxy::check must be implemented for specific platform')
  }
}

export default AbstractContactProxy
