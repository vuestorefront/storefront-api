import { Request } from 'express';
import { IConfig } from 'config';

class AbstractTaxProxy {
  private _request: Request
  private _config: IConfig

  protected constructor (config, req) {
    this._config = config
    this._request = req
  }

  public taxFor (product): Promise<any> {
    throw new Error('TaxProxy::taxFor must be implemented for specific platform')
  }

  /**
   * @param Array productList
   * @returns Promise
   */
  public process (productList, groupId = null): Promise<any> {
    throw new Error('TaxProxy::process must be implemented for specific platform')
  }
}

export default AbstractTaxProxy
