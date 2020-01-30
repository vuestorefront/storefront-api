import { Request } from 'express';
import { IConfig } from 'config';

class AbstractOrderProxy {
  protected _request: Request
  protected _config: IConfig
  public api: Record<string, Record<string, Function>>

  protected constructor (config, req) {
    this._config = config
    this._request = req
  }
  /*
    POST '/api/order/create`
    Queue the order into the order queue which will be asynchronously submitted to the eCommerce backend.

    #REQUEST BODY:
    The user_id field is a numeric user id as returned in api/user/me. The cart_id is a guest or authorized users quote id (You can mix guest cart with authroized user as well)

    {
        "user_id": "",
        "cart_id": "d90e9869fbfe3357281a67e3717e3524",
        "products": [
            {
                "sku": "WT08-XS-Yellow",
                "qty": 1
            }
        ],
        "addressInformation": {
            "shippingAddress": {
                "region": "",
                "region_id": 0,
                "country_id": "PL",
                "street": [
                    "Example",
                    "12"
                ],
                "company": "NA",
                "telephone": "",
                "postcode": "50-201",
                "city": "Wroclaw",
                "firstname": "Piotr",
                "lastname": "Karwatka",
                "email": "pkarwatka30@divante.pl",
                "region_code": ""
            },
            "billingAddress": {
                "region": "",
                "region_id": 0,
                "country_id": "PL",
                "street": [
                    "Example",
                    "12"
                ],
                "company": "Company name",
                "telephone": "",
                "postcode": "50-201",
                "city": "Wroclaw",
                "firstname": "Piotr",
                "lastname": "Karwatka",
                "email": "pkarwatka30@divante.pl",
                "region_code": "",
                "vat_id": "PL88182881112"
            },
            "shipping_method_code": "flatrate",
            "shipping_carrier_code": "flatrate",
            "payment_method_code": "cashondelivery",
            "payment_method_additional": {}
        },
        "order_id": "1522811662622-d3736c94-49a5-cd34-724c-87a3a57c2750",
        "transmited": false,
        "created_at": "2018-04-04T03:14:22.622Z",
        "updated_at": "2018-04-04T03:14:22.622Z"
    }
    #RESPONSE BODY:
    {
        "code":200,
        "result":"OK"
    }
    In case of the JSON validation error, the validation errors will be returned inside the result object.
  */
  public create (orderData): Promise<any> { throw new Error('AbstractOrderProxy::create must be implemented for specific platform') }
}

export default AbstractOrderProxy
