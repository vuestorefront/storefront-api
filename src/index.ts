import 'module-alias/register'

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import initializeDb from './db';
import { loadAdditionalCertificates } from './helpers/loadAdditionalCertificates'
import config from 'config';
import { ApolloServer } from 'apollo-server-express';
import * as path from 'path'
import enabledModules from 'src/modules'
import { registerModules } from './lib/module';
import { StorefrontApiContext } from './lib/module/types';
import { mergeResolvers, mergeTypes } from 'merge-graphql-schemas';

const app = express();
app.use(cors({
  exposedHeaders: config.get('corsHeaders')
}) as express.RequestHandler)

// logger
app.use(morgan('dev'));

app.use('/media', express.static(path.join(__dirname, config.get(`${config.get('platform')}.assetPath`))))

app.use(bodyParser.json({
  limit: config.get('bodyLimit')
}));

loadAdditionalCertificates()

// connect to db
initializeDb(db => {
  // internal middleware
  //

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  const context: StorefrontApiContext = { app, config, db }
  const { aggregatedGraphqlConfig, registeredModules } = registerModules(enabledModules, context)

  const server = new ApolloServer({ typeDefs: mergeTypes(aggregatedGraphqlConfig.schema, { all: true }), resolvers: aggregatedGraphqlConfig.resolvers, rootValue: global, playground: true, context: (integrationContext) => integrationContext })
  server.applyMiddleware({ app, path: '/graphql' });

  // app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

  const port = process.env.PORT || config.get('server.port')
  const host = process.env.HOST || config.get('server.host')
  app.listen(parseInt(port), host, () => {
    console.log(`Storefront GraphQL API started at http://${host}:${port}`);
  });
});

export default app;
