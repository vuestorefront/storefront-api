import { apiStatus, encryptToken, decryptToken, apiError } from 'src/lib/util';
import { Router } from 'express';
import PlatformFactory from 'src/platform/factory';
import jwt from 'jwt-simple';
import { merge } from 'lodash';

const Ajv = require('ajv'); // json validator
const fs = require('fs');

function addUserGroupToken (config, result) {
  /**
   * Add group id to token
   */
  const data = {
    group_id: result.group_id,
    id: result.id,
    user: result.email
  }

  result.groupToken = jwt.encode(data, config.authHashSecret ? config.authHashSecret : config.objHashSecret)
}

export default ({config, db}) => {
  let userApi = Router();

  const _getProxy = (req) => {
    const platform = config.platform
    const factory = new PlatformFactory(config, req)
    return factory.getAdapter(platform, 'user')
  };

  /**
   * POST create an user
   *
   * ```bash
   * curl 'https://your-domain.example.com/vsbridge/user/create' -H 'content-type: application/json' -H 'accept: application/json, text/plain'--data-binary '{"customer":{"email":"pkarwatka9998@divante.pl","firstname":"Joe","lastname":"Black"},"password":"SecretPassword!@#123"}'
   * ```
   * Request body:
   *
   * {
   *    "customer": {
   *       "email": "pkarwatka9998@divante.pl",
   *       "firstname": "Joe",
   *       "lastname": "Black"
   *    },
   *    "password": "SecretPassword"
   *    }
   *
   * Details: https://sfa-docs.now.sh/guide/default-modules/api.html#post-vsbridgeusercreate
   */
  userApi.post('/create', (req, res) => {
    const ajv = new Ajv();
    const userRegisterSchema = require('../models/userRegister.schema.json')
    let userRegisterSchemaExtension = {};
    if (fs.existsSync('../models/userRegister.schema.extension.json')) {
      userRegisterSchemaExtension = require('../models/userRegister.schema.extension.json');
    }
    const validate = ajv.compile(merge(userRegisterSchema, userRegisterSchemaExtension))

    if (!validate(req.body)) { // schema validation of upcoming order
      apiStatus(res, validate.errors, 400);
      return;
    }

    const userProxy = _getProxy(req)

    userProxy.register(req.body).then((result) => {
      apiStatus(res, result, 200);
    }).catch(err => {
      apiError(res, err);
    })
  })

  /**
   * POST login an user
   *
   * Request body:
   *
   * {
   * "username":"pkarwatka102@divante.pl",
   * "password":"TopSecretPassword"
   * }
   *
   * ```bash
   * curl 'https://your-domain.example.com/vsbridge/user/login' -H 'content-type: application/json' -H 'accept: application/json' --data-binary '"username":"pkarwatka102@divante.pl","password":"TopSecretPassword}'
   * ```
   *
   * Details: https://sfa-docs.now.sh/guide/default-modules/api.html#post-vsbridgeuserlogin
   */
  userApi.post('/login', (req, res) => {
    const userProxy = _getProxy(req)

    userProxy.login(req.body).then((result) => {
      /**
      * Second request for more user info
      */
      apiStatus(res, result, 200, {refreshToken: encryptToken(jwt.encode(req.body, config.authHashSecret ? config.authHashSecret : config.objHashSecret), config.authHashSecret ? config.authHashSecret : config.objHashSecret)});
    }).catch(err => {
      apiError(res, err);
    })
  });

  /**
   * POST refresh user token
   *
   * Request body:
   * {
   * "refreshToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEzOSJ9.a4HQc2HODmOj5SRMiv-EzWuMZbyIz0CLuVRhPw_MrOM"
   * }
   *
   * Details: https://sfa-docs.now.sh/guide/default-modules/api.html#post-vsbridgeuserrefresh
   */
  userApi.post('/refresh', (req, res) => {
    const userProxy = _getProxy(req)

    if (!req.body || !req.body.refreshToken) {
      return apiStatus(res, 'No refresh token provided', 500);
    }
    try {
      const decodedToken = jwt.decode(req.body ? decryptToken(req.body.refreshToken, config.authHashSecret ? config.authHashSecret : config.objHashSecret) : '', config.authHashSecret ? config.authHashSecret : config.objHashSecret)

      if (!decodedToken) {
        return apiStatus(res, 'Invalid refresh token provided', 500);
      }

      userProxy.login(decodedToken).then((result) => {
        apiStatus(res, result, 200, {refreshToken: encryptToken(jwt.encode(decodedToken, config.authHashSecret ? config.authHashSecret : config.objHashSecret), config.authHashSecret ? config.authHashSecret : config.objHashSecret)});
      }).catch(err => {
        apiError(res, err);
      })
    } catch (err) {
      apiError(res, err);
    }
  });

  /**
   * POST reset-password
   *
   * ```bash
   * curl 'https://your-domain.example.com/vsbridge/user/resetPassword' -H 'content-type: application/json' -H 'accept: application/json, text/plain' --data-binary '{"email":"pkarwatka992@divante.pl"}'
   * ```
   *
   * Request body:
   * {
   * "email": "pkarwatka992@divante.pl"
   * }
   *
   * Details: https://sfa-docs.now.sh/guide/default-modules/api.html#post-vsbridgeuserresetpassword
   */
  userApi.post('/resetPassword', (req, res) => {
    const userProxy = _getProxy(req)

    if (!req.body.email) {
      return apiStatus(res, 'Invalid e-mail provided!', 500)
    }

    userProxy.resetPassword({ email: req.body.email, template: 'email_reset', websiteId: 1 }).then((result) => {
      apiStatus(res, result, 200);
    }).catch(err => {
      apiError(res, err);
    })
  });

  /**
   * POST reset-password
   *
   * ```bash
   * curl 'https://your-domain.example.com/vsbridge/user/resetPassword' -H 'content-type: application/json' -H 'accept: application/json, text/plain' --data-binary '{"email":"pkarwatka992@divante.pl"}'
   * ```
   *
   * Request body:
   * {
   * "email": "pkarwatka992@divante.pl"
   * }
   *
   * Details: https://sfa-docs.now.sh/guide/default-modules/api.html#post-vsbridgeuserresetpassword
   */
  userApi.post('/reset-password', (req, res) => {
    const userProxy = _getProxy(req)
    const storeCode = req.query.storeCode
    const websiteId = config.storeViews[storeCode].websiteId

    if (!req.body.email) {
      return apiStatus(res, 'Invalid e-mail provided!', 500)
    }

    userProxy.resetPassword({ email: req.body.email, template: 'email_reset', websiteId }).then((result) => {
      apiStatus(res, result, 200);
    }).catch(err => {
      apiError(res, err);
    })
  });

  /**
   * GET  an user
   *
   * req.query.token - user token obtained from the `/api/user/login`
   *
   * Details: https://sfa-docs.now.sh/guide/default-modules/api.html#get-vsbridgeuserme
   */
  userApi.get('/me', (req, res) => {
    const userProxy = _getProxy(req)
    userProxy.me(req.query.token).then((result) => {
      addUserGroupToken(config, result)
      apiStatus(res, result, 200);
    }).catch(err => {
      apiError(res, err);
    })
  });

  /**
   * GET  an user order history
   *
   * req.query.token - user token
   *
   * Details: https://sfa-docs.now.sh/guide/default-modules/api.html#get-vsbridgeuserorder-history
   */
  userApi.get('/order-history', (req, res) => {
    const userProxy = _getProxy(req)
    userProxy.orderHistory(
      req.query.token,
      req.query.pageSize || 20,
      req.query.currentPage || 1
    ).then((result) => {
      apiStatus(res, result, 200);
    }).catch(err => {
      apiError(res, err);
    })
  });

  /**
   * POST for updating user
   *
   * Request body:
   *
   * {
   *    "customer": {
   *       "id": 222,
   *      "group_id": 1,
   *      "default_billing": "105",
   *      "default_shipping": "105",
   *      "created_at": "2018-03-16 19:01:18",
   *      "updated_at": "2018-04-03 12:59:13",
   *      "created_in": "Default Store View",
   *      "email": "pkarwatka30@divante.pl",
   *      "firstname": "Piotr",
   *      "lastname": "Karwatka",
   *      "store_id": 1,
   *      "website_id": 1,
   *      "addresses": [
   *      {
   *         "id": 109,
   *         "customer_id": 222,
   *         "region": {
   *         "region_code": null,
   *         "region": null,
   *         "region_id": 0
   *         },
   *         "region_id": 0,
   *         "country_id": "PL",
   *         "street": [
   *         "Dmowskiego",
   *         "17"
   *         ],
   *         "company": "Divante2",
   *         "telephone": "",
   *         "postcode": "50-203",
   *         "city": "Wrocław",
   *         "firstname": "Piotr",
   *         "lastname": "Karwatka2",
   *         "vat_id": "PL8951930748"
   *      }
   *      ],
   *      "disable_auto_group_change": 0
   *   }
   *}
   *
   * Details: https://sfa-docs.now.sh/guide/default-modules/api.html#post-vsbridgeuserme
   */
  userApi.post('/me', (req, res) => {
    const ajv = new Ajv();
    const userProfileSchema = require('../models/userProfile.schema.json')
    let userProfileSchemaExtension = {};
    if (fs.existsSync('../models/userProfile.schema.extension.json')) {
      userProfileSchemaExtension = require('../models/userProfile.schema.extension.json');
    }
    const validate = ajv.compile(merge(userProfileSchema, userProfileSchemaExtension))

    if (req.body.customer && req.body.customer.groupToken) {
      delete req.body.customer.groupToken
    }

    if (!validate(req.body)) {
      console.dir(validate.errors);
      apiStatus(res, validate.errors, 500);
      return;
    }

    const userProxy = _getProxy(req)
    userProxy.update({token: req.query.token, body: req.body}).then((result) => {
      addUserGroupToken(config, result)
      apiStatus(res, result, 200)
    }).catch(err => {
      apiStatus(res, err, 500)
    })
  })

  /**
   * POST for changing user's password
   *
   * Request body:
   *
   * {
   *  "currentPassword":"OldPassword",
   *  "newPassword":"NewPassword"
   * }
   */
  userApi.post('/changePassword', (req, res) => {
    const userProxy = _getProxy(req)
    userProxy.changePassword({ token: req.query.token, body: req.body }).then((result) => {
      apiStatus(res, result, 200)
    }).catch(err => {
      apiStatus(res, err, 500)
    })
  });

  /**
   * POST for changing user's password
   *
   * Request body:
   *
   * {
   *  "currentPassword":"OldPassword",
   *  "newPassword":"NewPassword"
   * }
   */
  userApi.post('/change-password', (req, res) => {
    const userProxy = _getProxy(req)
    userProxy.changePassword({token: req.query.token, body: req.body}).then((result) => {
      apiStatus(res, result, 200)
    }).catch(err => {
      apiStatus(res, err, 500)
    })
  });

  return userApi
}
