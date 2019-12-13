import { Request } from 'express';
import { IConfig } from 'config';

class AbstractContactProxy {
  private _request: Request
  private _config: IConfig

  public constructor (config, req) {
    this._config = config
    this._request = req
  }

  public submit (formData): Promise<any> {
    throw new Error('AbstractContactProxy::check must be implemented for specific platform')
  }
}

export default AbstractContactProxy
