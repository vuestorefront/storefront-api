import express, { Express } from 'express';
import cors from 'cors';
import config from 'config';
import { join } from 'path';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import { defaultTo } from 'lodash';
import {
  Logger,
  loadAdditionalCertificates,
  StorefrontApiContext,
  StorefrontApiModule,
  registerModules,
  BaseLogger, LogLevel
} from '@storefront-api/lib';
import { ApolloServer } from 'apollo-server-express';
import { mergeTypes } from 'merge-graphql-schemas';
import initializeDb from '@storefront-api/lib/db';
import { catchInvalidRequests } from '@storefront-api/lib/error';

interface ServerConfigParams {
  modules: StorefrontApiModule[],
  port?: number,
  host?: string,
  loadDefaultMiddlewares?: boolean
}

export class Server {
  public express: Express
  public isProd: boolean
  public hasGraphqlSupport: boolean = false
  private readonly port: number
  private readonly host: string
  private readonly modules: StorefrontApiModule[]

  public constructor (ServerConfig: ServerConfigParams) {
    this.express = express();
    this.isProd = process.env.NODE_ENV === 'production'

    const port = ServerConfig.port || process.env.PORT || config.get<string>('server.port')
    const host = ServerConfig.host || process.env.HOST || config.get<string>('server.host')

    if (!port) {
      throw Error('No port for server was given')
    }
    this.port = Number(port)

    if (!host) {
      throw Error('No host for server was given')
    }
    this.host = host

    if (defaultTo(ServerConfig.loadDefaultMiddlewares, true)) {
      this.registerDefaultMiddlewares()
    }

    this.modules = defaultTo(ServerConfig.modules, [])

    this.init()
  }

  private init () {
    loadAdditionalCertificates()
    initializeDb(db => {
      const logger = new Logger()

      const context: StorefrontApiContext = { app: this.express, config, db, logger }
      const { aggregatedGraphqlConfig } = registerModules(this.modules, context, logger)

      if (aggregatedGraphqlConfig.hasGraphqlSupport) {
        const server = new ApolloServer({
          typeDefs: mergeTypes(aggregatedGraphqlConfig.schema, { all: true }),
          resolvers: aggregatedGraphqlConfig.resolvers,
          rootValue: global,
          playground: true,
          formatError: (err) => {
            if (!this.isProd) logger.error(err)
            return err
          },
          context: (integrationContext) => ({
            ...integrationContext,
            config,
            db,
            logger
          })
        })
        server.applyMiddleware({ app: this.express, path: '/graphql' });
      } else {
        logger.info('No GraphQL Support enabled. Please provide at least one module supporting graphQL schema.')
      }
    });

    this.express.use(catchInvalidRequests);
  }

  public registerDefaultMiddlewares (): void {
    //  middleware start
    this.express.use(cors({
      exposedHeaders: config.get('corsHeaders')
    }) as express.RequestHandler)

    // logger
    this.express.use(morgan(!this.isProd ? 'dev' : ''));

    this.express.use('/media', express.static(join(__dirname, config.get(`${config.get('platform')}.assetPath`))))

    this.express.use(bodyParser.json({
      limit: config.get('bodyLimit')
    }));

    this.express.use(bodyParser.urlencoded({ extended: true }));
    this.express.use(bodyParser.json());
  }

  public start (): void {
    this.express.listen(this.port, this.host, () => {
      Logger.info(`Storefront REST API started at http://${this.host}:${this.port}`);
      if (this.hasGraphqlSupport) {
        Logger.info(`Storefront GraphQL API started at http://${this.host}:${this.port}/graphql`);
      }
    });
  }

  public overWriteLogger (logger: BaseLogger | LogLevel[] | boolean) {
    Logger.overrideLogger(logger)
  }
}
