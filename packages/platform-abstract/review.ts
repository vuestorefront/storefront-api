import { Request } from 'express';
import { IConfig } from 'config';

class AbstractReviewProxy {
  protected _request: Request
  protected _config: IConfig
  public api: Record<string, Record<string, Function>>

  protected constructor (config, req) {
    this._config = config
    this._request = req
  }
  public create (reviewData): Promise<any> {
    throw new Error('ReviewProxy::check must be implemented for specific platform')
  }
}

export default AbstractReviewProxy
