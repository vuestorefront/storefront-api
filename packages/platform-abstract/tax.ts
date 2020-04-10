import { Request } from 'express';
import { IConfig } from 'config';

class AbstractTaxProxy {
  protected _config: IConfig
  public api: Record<string, Record<string, Function>>
  public _entityType: any
  public _indexName: any
  public _sourcePriceInclTax: any
  public _finalPriceInclTax: any
  public _userGroupId: any
  public _storeConfigTax: any

  protected constructor (config) {
    this._config = config
  }

  public taxFor (product, args): Promise<any>|any {
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
