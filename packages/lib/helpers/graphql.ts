import path from 'path';
import { fileLoader } from 'merge-graphql-schemas';

export function loadModuleResolversArray (graphQlPath: string, extensionsPath?: string): any[] {
  const fileLoaderExt = process.env.VS_ENV === 'dev' ? 'ts' : 'js'
  const rootResolvers = fileLoader(path.join(graphQlPath, `*.resolver.${fileLoaderExt}`))
  const coreResolvers = fileLoader(
    path.join(graphQlPath, `/**/resolver.${fileLoaderExt}`)
  );
  const extensionsResolvers = extensionsPath ? fileLoader(
    path.join(extensionsPath, `/**/resolver.${fileLoaderExt}`)
  ) : [];
  return rootResolvers.concat(coreResolvers).concat(extensionsResolvers)
}

export function loadModuleSchemaArray (graphQlPath: string, extensionsPath?: string): any[] {
  const rootSchemas = fileLoader(path.join(graphQlPath, '*.graphqls'))
  const coreSchemas = fileLoader(
    path.join(graphQlPath, '/**/*.graphqls')
  );
  const extensionsSchemas = extensionsPath ? fileLoader(
    path.join(extensionsPath, '/**/*.graphqls')
  ) : []
  return rootSchemas.concat(coreSchemas).concat(extensionsSchemas)
}
