import config from 'config'

export function catchInvalidRequests (err, req, res, next) {
  const { statusCode, message = '', stack = '' } = err;
  const stackTrace = stack
    .split(/\r?\n/)
    .map(string => string.trim())
    .filter(string => string !== '')

  res.status(statusCode).json({
    code: statusCode,
    result: message,
    ...(config.get('server.showErrorStack') ? { stack: stackTrace } : {})
  });
}
