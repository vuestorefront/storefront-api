import { Request } from 'express';
import { IConfig } from 'config';

class AbstractStockProxy {
  protected _request: Request
  protected _config: IConfig
  public api: Record<string, Record<string, Function>>

  protected constructor (config, req) {
    this._config = config
    this._request = req
  }

  /*
    GET /api/stock/check/:sku
    This method is used to check the stock item for specified product sku
    https://sfa-docs.now.sh/guide/default-modules/api.html#get-api-stock-check-sku

    #RESPONSE BODY:
    {
      "code": 200,
      "result": {
        "item_id": 580,
        "product_id": 580,
        "stock_id": 1,
        "qty": 53,
        "is_in_stock": true,
        "is_qty_decimal": false,
        "show_default_notification_message": false,
        "use_config_min_qty": true,
        "min_qty": 0,
        "use_config_min_sale_qty": 1,
        "min_sale_qty": 1,
        "use_config_max_sale_qty": true,
        "max_sale_qty": 10000,
        "use_config_backorders": true,
        "backorders": 0,
        "use_config_notify_stock_qty": true,
        "notify_stock_qty": 1,
        "use_config_qty_increments": true,
        "qty_increments": 0,
        "use_config_enable_qty_inc": true,
        "enable_qty_increments": false,
        "use_config_manage_stock": true,
        "manage_stock": true,
        "low_stock_date": null,
        "is_decimal_divided": false,
        "stock_status_changed_auto": 0
      }
    }
  */
  public check (sku): Promise<any> {
    throw new Error('UserProxy::check must be implemented for specific platform')
  }
}

export default AbstractStockProxy
