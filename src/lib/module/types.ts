import { IConfig } from 'config'
import { Express } from 'express';
import { RedisClient } from 'redis';
import { Client as Client7 } from 'es7';
import { Client as Client6 } from 'es6';
import { Client as Client5 } from 'es5';
import { Client } from '@elastic/elasticsearch'
import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';

export interface DbContext {
  getElasticClient(): Client|Client7|Client6|Client5,
  getRedisClient(): RedisClient
}

export interface StorefrontApiContext {
  config?: IConfig,
  app: Express,
  db: DbContext
}

export interface GraphqlConfiguration {
  schema: any[],
  resolvers: any[],
  hasGraphqlSupport: boolean
}

export interface ElasticSearchMappings {
  schemas: any
}
export interface StorefrontApiModuleConfig {
  key: string,
  initMiddleware?: (context: StorefrontApiContext) => void,
  initApi?: (context: StorefrontApiContext) => void,
  initGraphql?: (context: StorefrontApiContext) => GraphqlConfiguration,
  loadMappings?: (context: StorefrontApiContext) => ElasticSearchMappings,
  beforeRegistration?: (context: StorefrontApiContext) => void,
  afterRegistration?: (context: StorefrontApiContext) => void
}

export interface StoreFrontResloverContext extends ExpressContext {
  config?: IConfig,
  db: DbContext
}
