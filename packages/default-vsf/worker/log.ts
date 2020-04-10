import winston from 'winston'

winston['emitErrs'] = true;

if (!global['logger']) {
  // @ts-ignore
  global['logger'] = new winston.Logger({
    transports: [
      new winston.transports.Console({
        level: 'info',
        handleExceptions: false,
        // @ts-ignore
        json: false,
        prettyPrint: true,
        colorize: true,
        timestamp: true
      })
    ],
    exitOnError: false
  });
}

module.exports = global['logger'];
