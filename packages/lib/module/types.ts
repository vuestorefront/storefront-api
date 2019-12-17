import { IConfig } from 'config'
import { Express } from 'express';
import { RedisClient } from 'redis';
import { Client } from '@elastic/elasticsearch'
import { ExpressContext } from 'apollo-server-express/dist/ApolloServer'
import {BaseLogger} from '../logger';

export interface DbContext {
  getElasticClient(): Client,
  getRedisClient(): RedisClient
}

export interface StorefrontApiContext {
  config?: IConfig,
  app: Express,
  db: DbContext,
  logger: BaseLogger
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
  db: DbContext,
  logger: BaseLogger
}
