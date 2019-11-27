import express, { RequestHandler } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import initializeDb from './db';
import middleware from './middleware';
import { loadAdditionalCertificates } from './helpers/loadAdditionalCertificates'
import api from './api';
import config from 'config';
import img from './api/img';
import invalidateCache from './api/invalidate'
import { ApolloServer } from 'apollo-server-express';
import resolvers from './graphql/resolvers';
import typeDefs from './graphql/schema';
import * as path from 'path'

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
  app.use(middleware({ config, db }));

  // api router
  app.use('/api', api({ config, db }));
  app.use('/img', img({ config, db }));
  app.use('/img/:width/:height/:action/:image', (req, res, next) => {
    console.log(req.params)
  });
  app.post('/invalidate', invalidateCache)
  app.get('/invalidate', invalidateCache)

  const port = process.env.PORT || config.get('server.port')
  const host = process.env.HOST || config.get('server.host')
  app.listen(parseInt(port), host, () => {
    console.log(`Storefront GraphQL API started at http://${host}:${port}`);
  });
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const server = new ApolloServer({ typeDefs, resolvers, rootValue: global, playground: true, context: (integrationContext) => integrationContext })
server.applyMiddleware({ app, path: '/graphql' });

// app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

export default app;
