import { Request } from 'express';
import { IConfig } from 'config';

class AbstractUserProxy {
  protected _request: Request
  protected _config: IConfig
  public api: Record<string, Record<string, Function>>

  protected constructor (config, req) {
    this._config = config
    this._request = req
  }

  /*
    POST /api/user/create
    Registers new user to eCommerce backend users database.
    https://sfa-docs.now.sh/guide/default-modules/api.html#post-api-user-create

    #EXAMPLE CALL:
    curl 'https://your-domain.example.com/api/user/create' -H 'content-type: application/json' --data-binary '{"customer":{"email":"pkarwatka9998@divante.pl","firstname":"Joe","lastname":"Black"},"password":"SecretPassword!@#123"}'
    #REQUEST BODY:
    {
      "customer": {
        "email": "pkarwatka9998@divante.pl",
        "firstname": "Joe",
        "lastname": "Black"
      },
      "password": "SecretPassword"
    }
    #RESPONSE BODY:
    In case of success

    {
      "code": 200,
      "result": {
        "id": 286,
        "group_id": 1,
        "created_at": "2018-04-03 13:35:13",
        "updated_at": "2018-04-03 13:35:13",
        "created_in": "Default Store View",
        "email": "pkarwatka9998@divante.pl",
        "firstname": "Joe",
        "lastname": "Black",
        "store_id": 1,
        "website_id": 1,
        "addresses": [],
        "disable_auto_group_change": 0
      }
    }
    In case of error:

    {
      "code": 500,
      "result": "Minimum of different classes of characters in password is 3. Classes of characters: Lower Case, Upper Case, Digits, Special Characters."
    }
  */
  public register (userData): Promise<any> {
    throw new Error('UserProxy::register must be implemented for specific platform')
  }

  /*
    POST /api/user/login
    Authorizes the user. It's called after user submits "Login" form inside the Storefront app. It returns the user token which should be used for all subsequent API calls that requires authorization
    https://sfa-docs.now.sh/guide/default-modules/api.html#post-api-user-login

    #GET PARAMS:
    null
    #REQUEST BODY:
    {
        "username":"pkarwatka102@divante.pl",
        "password":"TopSecretPassword"}
    #RESPONSE BODY:
    curl 'https://your-domain.example.com/api/user/login' -H 'content-type: application/json' -H 'accept: application/json' --data-binary '"username":"pkarwatka102@divante.pl","password":"TopSecretPassword}'

    {
        "code":200,
        "result":"xu8h02nd66yq0gaayj4x3kpqwity02or",
        "meta": { "refreshToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEzOSJ9.a4HQc2HODmOj5SRMiv-EzWuMZbyIz0CLuVRhPw_MrOM" }
    }
    or in case of error:

    {
        "code":500,
        "result":"You did not sign in correctly or your account is temporarily disabled."
    }
    The result is a authorization token, that should be passed via ?token=xu8h02nd66yq0gaayj4x3kpqwity02or GET param to all subsequent API calls that requires authorization

    #RESPONSE CODES:
    200 when success
    500 in case of error
  */
  public login (userData): Promise<any> {
    throw new Error('UserProxy::login must be implemented for specific platform')
  }

  /*
    GET /api/user/me
    Gets the User profile for currently authorized user. It's called after POST /api/user/login successful call.
    https://sfa-docs.now.sh/guide/default-modules/api.html#get-api-user-me

    #GET PARAMS:
    token - user token returned from POST /api/user/login

    #RESPONSE BODY:
    {
        "code":200,
        "result":
            {
                "id":158,
                "group_id":1,
                "default_shipping":"67",
                "created_at":"2018-02-28 12:05:39",
                "updated_at":"2018-03-29 10:46:03",
                "created_in":"Default Store View",
                "email":"pkarwatka102@divante.pl",
                "firstname":"Piotr",
                "lastname":"Karwatka",
                "store_id":1,
                "website_id":1,
                "addresses":[
                        {
                            "id":67,
                            "customer_id":158,
                            "region":
                                {
                                    "region_code":null,
                                    "region":null,
                                    "region_id":0
                                },
                            "region_id":0,
                            "country_id":"PL",
                            "street": ["Street name","13"],
                            "telephone":"",
                            "postcode":"41-157",
                            "city":"Wrocław",
                            "firstname":"John","lastname":"Murphy",
                            "default_shipping":true
                        }],
                "disable_auto_group_change":0
            }
    }
    #RESPONSE CODES:
    200 when success
    500 in case of error
  */
  public me (requestToken): Promise<any> {
    throw new Error('UserProxy::me must be implemented for specific platform')
  }

  /*
    GET /api/user/order-history
    Get the user order history from server side

    #GET PARAMS:
    token - user token returned from POST /api/user/login

    #RESPONSE BODY:
    {
        "code": 200,
        "result": {
            "items": [
                {
                    "applied_rule_ids": "1,5",
                    "base_currency_code": "USD",
                    "base_discount_amount": -3.3,
                    "base_grand_total": 28,
                    "base_discount_tax_compensation_amount": 0,
                    "base_shipping_amount": 5,
                    "base_shipping_discount_amount": 0,
                    "base_shipping_incl_tax": 5,
                    "base_shipping_tax_amount": 0,
                    "base_subtotal": 22,
                    "base_subtotal_incl_tax": 27.06,
                    "base_tax_amount": 4.3,
                    "base_total_due": 28,
                    "base_to_global_rate": 1,
                    "base_to_order_rate": 1,
                    "billing_address_id": 204,
                    "created_at": "2018-01-23 15:30:04",
                    "customer_email": "pkarwatka28@example.com",
                    "customer_group_id": 0,
                    "customer_is_guest": 1,
                    "customer_note_notify": 1,
                    "discount_amount": -3.3,
                    "email_sent": 1,
                    "entity_id": 102,
                    "global_currency_code": "USD",
                    "grand_total": 28,
                    "discount_tax_compensation_amount": 0,
                    "increment_id": "000000102",
                    "is_virtual": 0,
                    "order_currency_code": "USD",
                    "protect_code": "3984835d33abd2423b8a47efd0f74579",
                    "quote_id": 1112,
                    "shipping_amount": 5,
                    "shipping_description": "Flat Rate - Fixed",
                    "shipping_discount_amount": 0,
                    "shipping_discount_tax_compensation_amount": 0,
                    "shipping_incl_tax": 5,
                    "shipping_tax_amount": 0,
                    "state": "new",
                    "status": "pending",
                    "store_currency_code": "USD",
                    "store_id": 1,
                    "store_name": "Main Website\nMain Website Store\n",
                    "store_to_base_rate": 0,
                    "store_to_order_rate": 0,
                    "subtotal": 22,
                    "subtotal_incl_tax": 27.06,
                    "tax_amount": 4.3,
                    "total_due": 28,
                    "total_item_count": 1,
                    "total_qty_ordered": 1,
                    "updated_at": "2018-01-23 15:30:05",
                    "weight": 1,
                    "items": [
                        {
                            "amount_refunded": 0,
                            "applied_rule_ids": "1,5",
                            "base_amount_refunded": 0,
                            "base_discount_amount": 3.3,
                            "base_discount_invoiced": 0,
                            "base_discount_tax_compensation_amount": 0,
                            "base_original_price": 22,
                            "base_price": 22,
                            "base_price_incl_tax": 27.06,
                            "base_row_invoiced": 0,
                            "base_row_total": 22,
                            "base_row_total_incl_tax": 27.06,
                            "base_tax_amount": 4.3,
                            "base_tax_invoiced": 0,
                            "created_at": "2018-01-23 15:30:04",
                            "discount_amount": 3.3,
                            "discount_invoiced": 0,
                            "discount_percent": 15,
                            "free_shipping": 0,
                            "discount_tax_compensation_amount": 0,
                            "is_qty_decimal": 0,
                            "is_virtual": 0,
                            "item_id": 224,
                            "name": "Radiant Tee-XS-Blue",
                            "no_discount": 0,
                            "order_id": 102,
                            "original_price": 22,
                            "price": 22,
                            "price_incl_tax": 27.06,
                            "product_id": 1546,
                            "product_type": "simple",
                            "qty_canceled": 0,
                            "qty_invoiced": 0,
                            "qty_ordered": 1,
                            "qty_refunded": 0,
                            "qty_shipped": 0,
                            "quote_item_id": 675,
                            "row_invoiced": 0,
                            "row_total": 22,
                            "row_total_incl_tax": 27.06,
                            "row_weight": 1,
                            "sku": "WS12-XS-Blue",
                            "store_id": 1,
                            "tax_amount": 4.3,
                            "tax_invoiced": 0,
                            "tax_percent": 23,
                            "updated_at": "2018-01-23 15:30:04",
                            "weight": 1
                        }
                    ],
                    "billing_address": {
                        "address_type": "billing",
                        "city": "Some city2",
                        "company": "Divante",
                        "country_id": "PL",
                        "email": "pkarwatka28@example.com",
                        "entity_id": 204,
                        "firstname": "Piotr",
                        "lastname": "Karwatka",
                        "parent_id": 102,
                        "postcode": "50-203",
                        "street": [
                            "XYZ",
                            "17"
                        ],
                        "telephone": null,
                        "vat_id": "PL8951930748"
                    },
                    "payment": {
                        "account_status": null,
                        "additional_information": [
                            "Cash On Delivery",
                            ""
                        ],
                        "amount_ordered": 28,
                        "base_amount_ordered": 28,
                        "base_shipping_amount": 5,
                        "cc_last4": null,
                        "entity_id": 102,
                        "method": "cashondelivery",
                        "parent_id": 102,
                        "shipping_amount": 5
                    },
                    "status_histories": [],
                    "extension_attributes": {
                        "shipping_assignments": [
                            {
                                "shipping": {
                                    "address": {
                                        "address_type": "shipping",
                                        "city": "Some city",
                                        "company": "NA",
                                        "country_id": "PL",
                                        "email": "pkarwatka28@example.com",
                                        "entity_id": 203,
                                        "firstname": "Piotr",
                                        "lastname": "Karwatka",
                                        "parent_id": 102,
                                        "postcode": "51-169",
                                        "street": [
                                            "XYZ",
                                            "13"
                                        ],
                                        "telephone": null
                                    },
                                    "method": "flatrate_flatrate",
                                    "total": {
                                        "base_shipping_amount": 5,
                                        "base_shipping_discount_amount": 0,
                                        "base_shipping_incl_tax": 5,
                                        "base_shipping_tax_amount": 0,
                                        "shipping_amount": 5,
                                        "shipping_discount_amount": 0,
                                        "shipping_discount_tax_compensation_amount": 0,
                                        "shipping_incl_tax": 5,
                                        "shipping_tax_amount": 0
                                    }
                                },
                                "items": [
                                    {
                                        "amount_refunded": 0,
                                        "applied_rule_ids": "1,5",
                                        "base_amount_refunded": 0,
                                        "base_discount_amount": 3.3,
                                        "base_discount_invoiced": 0,
                                        "base_discount_tax_compensation_amount": 0,
                                        "base_original_price": 22,
                                        "base_price": 22,
                                        "base_price_incl_tax": 27.06,
                                        "base_row_invoiced": 0,
                                        "base_row_total": 22,
                                        "base_row_total_incl_tax": 27.06,
                                        "base_tax_amount": 4.3,
                                        "base_tax_invoiced": 0,
                                        "created_at": "2018-01-23 15:30:04",
                                        "discount_amount": 3.3,
                                        "discount_invoiced": 0,
                                        "discount_percent": 15,
                                        "free_shipping": 0,
                                        "discount_tax_compensation_amount": 0,
                                        "is_qty_decimal": 0,
                                        "is_virtual": 0,
                                        "item_id": 224,
                                        "name": "Radiant Tee-XS-Blue",
                                        "no_discount": 0,
                                        "order_id": 102,
                                        "original_price": 22,
                                        "price": 22,
                                        "price_incl_tax": 27.06,
                                        "product_id": 1546,
                                        "product_type": "simple",
                                        "qty_canceled": 0,
                                        "qty_invoiced": 0,
                                        "qty_ordered": 1,
                                        "qty_refunded": 0,
                                        "qty_shipped": 0,
                                        "quote_item_id": 675,
                                        "row_invoiced": 0,
                                        "row_total": 22,
                                        "row_total_incl_tax": 27.06,
                                        "row_weight": 1,
                                        "sku": "WS12-XS-Blue",
                                        "store_id": 1,
                                        "tax_amount": 4.3,
                                        "tax_invoiced": 0,
                                        "tax_percent": 23,
                                        "updated_at": "2018-01-23 15:30:04",
                                        "weight": 1
                                    }
                                ]
                            }
                        ]
                    }
                }
            ],
            "search_criteria": {
                "filter_groups": [
                    {
                        "filters": [
                            {
                                "field": "customer_email",
                                "value": "pkarwatka28@example.com",
                                "condition_type": "eq"
                            }
                        ]
                    }
                ]
            },
            "total_count": 61
        }
    }
  */
  public orderHistory (requestToken, pageSize, currentPage): Promise<any> {
    throw new Error('UserProxy::orderHistory must be implemented for specific platform')
  }

  /*
    POST /api/user/reset-password
    Sends the password reset link for the specified user.

    #EXAMPLE CALL:
    curl 'https://your-domain.example.com/api/user/reset-password' -H 'content-type: application/json' -H 'accept: application/json, text/plain' --data-binary '{"email":"pkarwatka992@divante.pl"}'
    #REQUEST BODY:
    {
      "email": "pkarwatka992@divante.pl"
    }
    #RESPONSE BODY:
    {
      "code": 500,
      "result": "No such entity with email = pkarwatka992@divante.pl, websiteId = 1"
    }
  */
  public resetPassword (emailData): Promise<any> {
    throw new Error('UserProxy::resetPassword must be implemented for specific platform')
  }

  /*
    POST /api/user/me
    Updates the user address and other data information.
    https://sfa-docs.now.sh/guide/default-modules/api.html#post-api-user-me

    #GET PARAMS:
    token - user token returned from POST /api/user/login

    #REQUEST BODY:
    As the request You should post the address information You like to apply to the current user (identified by the token).

    {
      "customer": {
        "id": 222,
        "group_id": 1,
        "default_billing": "105",
        "default_shipping": "105",
        "created_at": "2018-03-16 19:01:18",
        "updated_at": "2018-04-03 12:59:13",
        "created_in": "Default Store View",
        "email": "pkarwatka30@divante.pl",
        "firstname": "Piotr",
        "lastname": "Karwatka",
        "store_id": 1,
        "website_id": 1,
        "addresses": [
          {
            "id": 109,
            "customer_id": 222,
            "region": {
              "region_code": null,
              "region": null,
              "region_id": 0
            },
            "region_id": 0,
            "country_id": "PL",
            "street": [
              "Dmowskiego",
              "17"
            ],
            "company": "Divante2",
            "telephone": "",
            "postcode": "50-203",
            "city": "Wrocław",
            "firstname": "Piotr",
            "lastname": "Karwatka2",
            "vat_id": "PL8951930748"
          }
        ],
        "disable_auto_group_change": 0
      }
    }
    #RESPONSE BODY:
    In the response You'll get the current, updated information about the user.

    {
      "code": 200,
      "result": {
        "id": 222,
        "group_id": 1,
        "created_at": "2018-03-16 19:01:18",
        "updated_at": "2018-04-04 02:59:52",
        "created_in": "Default Store View",
        "email": "pkarwatka30@divante.pl",
        "firstname": "Piotr",
        "lastname": "Karwatka",
        "store_id": 1,
        "website_id": 1,
        "addresses": [
          {
            "id": 109,
            "customer_id": 222,
            "region": {
              "region_code": null,
              "region": null,
              "region_id": 0
            },
            "region_id": 0,
            "country_id": "PL",
            "street": [
              "Dmowskiego",
              "17"
            ],
            "company": "Divante2",
            "telephon e": "",
            "postcode": "50-203",
            "city": "Wrocław",
            "firstname": "Piotr",
            "lastname": "Karwatka2",
            "vat_id": "PL8951930748"
          }
        ],
        "disable_auto_group_change": 0
      }
    }
    #RESPONSE CODES:
    200 when success
    500 in case of error
  */
  public update (userData): Promise<any> { throw new Error('AbstractUserProxy::update must be implemented for specific platform') }
  public changePassword (passwordData): Promise<any> { throw new Error('AbstractUserProxy::changePassword must be implemented for specific platform') }
  public resetPasswordUsingResetToken (resetData): Promise<any> { throw new Error('AbstractUserProxy::resetPasswordUsingResetToken must be implemented for specific platform') }
}

export default AbstractUserProxy
