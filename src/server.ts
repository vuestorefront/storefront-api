import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import initializeDb from '@storefront-api/lib/db';
import { loadAdditionalCertificates } from '@storefront-api/lib/helpers/loadAdditionalCertificates'
import config from 'config';
import { ApolloServer } from 'apollo-server-express';
import { join } from 'path'
import enabledModules from './modules'
import { registerModules } from '@storefront-api/lib/module';
import { StorefrontApiContext } from '@storefront-api/lib/module/types';
import { mergeTypes } from 'merge-graphql-schemas';
import Logger from '@storefront-api/lib/logger'

const app = express();

//  middleware start
app.use(cors({
  exposedHeaders: config.get('corsHeaders')
}) as express.RequestHandler)

// logger
app.use(morgan('dev'));

app.use('/media', express.static(join(__dirname, config.get(`${config.get('platform')}.assetPath`))))

app.use(bodyParser.json({
  limit: config.get('bodyLimit')
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//  middleware end

loadAdditionalCertificates()
let hasGraphqlSupport = false
// connect to db
initializeDb(db => {
  const logger = new Logger()

  const context: StorefrontApiContext = { app, config, db, logger }
  const { aggregatedGraphqlConfig } = registerModules(enabledModules, context, logger)

  if (aggregatedGraphqlConfig.hasGraphqlSupport) {
    const server = new ApolloServer({
      typeDefs: mergeTypes(aggregatedGraphqlConfig.schema, { all: true }),
      resolvers: aggregatedGraphqlConfig.resolvers,
      rootValue: global,
      playground: true,
      context: (integrationContext) => ({
        ...integrationContext,
        config,
        db,
        logger
      })
    })
    server.applyMiddleware({ app, path: '/graphql' });
  } else {
    logger.info('No GraphQL Support enabled. Please provide at least one module supporting graphQL schema.')
  }

  hasGraphqlSupport = aggregatedGraphqlConfig.hasGraphqlSupport
});

export default app;
export {
  hasGraphqlSupport
}
