import winston from 'winston'

if (!global['logger']) {
  global['logger'] = winston.createLogger({
    transports: [
      new winston.transports.Console({
        level: 'info',
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.json(),
          winston.format.timestamp(),
          winston.format.prettyPrint()
        ),
        handleExceptions: false
      })
    ],
    exitOnError: false
  });
}

module.exports = global['logger'];
