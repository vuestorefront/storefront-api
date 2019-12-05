import { IConfig } from 'config'
import { Router, Express } from 'express';
import { NextHandleFunction } from 'connect';
import { DocumentNode } from 'graphql'
import { ApolloServer } from 'apollo-server-express'

export interface DbContext { getElasticClient: () => any, getRedisClient: () => any}

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
