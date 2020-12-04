import config from 'config'
import crypto from 'crypto'
import fs from 'fs'

const algorithm = 'aes-256-ctr'
const iv = ((buildFilePath = '../config/build.json', ivLength = 16): string | Buffer => {
  if (!config.get<boolean>('cipherIVByBuildTime')) return 'XXXXXXXXXXXXXXXX'
  const buildFile = fs.existsSync(buildFilePath) && fs.readFileSync(buildFilePath, 'utf8')
  if (buildFile) {
    const build: { time: string|number } = JSON.parse(buildFile)
    const buildHash = crypto.createHash('md5').update(`${build.time}`, 'utf8').digest('hex')
    return buildHash.slice(0, ivLength)
  }
  return crypto.randomBytes(ivLength)
})()

/**
 * Get current store code from parameter passed from the vue storefront frotnend app
 * @param {Express.Request} req
 */
export function getCurrentStoreCode (req): string|null {
  if (req.headers['x-vs-store-code']) {
    return req.headers['x-vs-store-code']
  }
  if (req.query.storeCode) {
    return req.query.storeCode
  }
  return null
}

/**
 * Get the config.storeViews[storeCode]
 * @param {string} storeCode
 */
export function getCurrentStoreView (storeCode: string = null): any {
  let storeView = { // current, default store
    tax: config.get('tax'),
    i18n: config.get('i18n'),
    elasticsearch: config.get('elasticsearch'),
    storeCode: null,
    storeId: config.get('defaultStoreCode') && config.get('defaultStoreCode') !== ''
      ? config.get<Record<string, any>>('storeViews')[config.get<string>('defaultStoreCode')].storeId
      : 1
  }
  if (storeCode && config.get<Record<string, any>>('storeViews')[storeCode]) {
    storeView = config.get<Record<string, any>>('storeViews')[storeCode]
  }
  return storeView // main config is used as default storeview
}

/**  Creates a callback that proxies node callback style arguments to an Express Response object.
 *  @param {express.Response} res  Express HTTP Response
 *  @param {number} [status=200]  Status code to send on success
 *
 *  @example
 *    list(req, res) {
 *      collection.find({}, toRes(res));
 *    }
 */
export function toRes (res, status = 200) {
  return (err, thing) => {
    if (err) return res.status(500).send(err);

    if (thing && typeof thing.toObject === 'function') {
      thing = thing.toObject();
    }
    res.status(status).json(thing);
  };
}

export function sgnSrc (sgnObj, item) {
  if (config.get('tax.alwaysSyncPlatformPricesOver')) {
    sgnObj.id = item.id
  } else {
    sgnObj.sku = item.sku
  }
  // console.log(sgnObj)
  return sgnObj
}

/**  Creates a api status call and sends it thru to Express Response object.
 *  @param {express.Response} res  Express HTTP Response
 *  @param {number} [code=200]    Status code to send on success
 *  @param {json} [result='OK']    Text message or result information object
 */
export function apiStatus (res, result: string|Record<any, any> = 'OK', code = 200, meta = null): string|Record<any, any> {
  const apiResult: Record<string, any> = { code: code, result: result };
  if (meta !== null) {
    apiResult.meta = meta;
  }
  res.status(code).json(apiResult);
  return result;
}

/**
 *  Creates an error for API status of Express Response object.
 *
 *  @param {express.Response} res   Express HTTP Response
 *  @param {object} error    Error object or error message
 *  @return {json} [result='OK']    Text message or result information object
 */
export function apiError (res, error: Record<any, any>): string|Record<any, any> {
  let errorCode = error.code || error.status;
  let errorMessage = error.errorMessage || error;
  if (error instanceof Error) {
    // Class 'Error' is not serializable with JSON.stringify, extract data explicitly.
    errorCode = (error as any).code || errorCode;
    errorMessage = error.message;
  }
  return apiStatus(res, errorMessage, Number(errorCode) || 500);
}

/**
 *  Encrypt a token string using `aes-256-ctr` algorithm
 *
 *  @param {string} textToken
 *  @param {secret} string Needs to be a 16 bit/32 glyphs sized string to fit the `aes-256-ctr` requirements
 *  @return {string}
 */
export function encryptToken (textToken: string, secret: string): string {
  const cipher = crypto.createCipheriv(algorithm, secret, iv)
  let crypted = cipher.update(textToken, 'utf8', 'hex')
  crypted += cipher.final('hex')
  return crypted
}

/**
 *  Decrypt a token string using `aes-256-ctr` algorithm
 *
 *  @param {string} textToken
 *  @param {secret} string Needs to be a 16 bit/32 glyphs sized string to fit the `aes-256-ctr` requirements
 *  @return {string}
 */
export function decryptToken (textToken: string, secret: string): string {
  const decipher = crypto.createDecipheriv(algorithm, secret, iv)
  let decrypted = decipher.update(textToken, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}
