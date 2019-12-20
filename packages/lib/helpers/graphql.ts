import path from 'path';
import { fileLoader } from 'merge-graphql-schemas';

export function loadModuleResolversArray (graphQlPath: string, extensionsPath?: string) {
  const rootResolvers = fileLoader(path.join(graphQlPath, `*.resolver.{js,ts}`))
  const coreResolvers = fileLoader(
    path.join(graphQlPath, `/**/resolver.{js,ts}`)
  );
  const extensionsResolvers = extensionsPath ? fileLoader(
    path.join(extensionsPath, `/**/resolver.{js,ts}`)
  ) : [];
  return rootResolvers.concat(coreResolvers).concat(extensionsResolvers)
}

export function loadModuleSchemaArray (graphQlPath: string, extensionsPath?: string) {
  const rootSchemas = fileLoader(path.join(graphQlPath, `*.graphqls`))
  const coreSchemas = fileLoader(
    path.join(graphQlPath, `/**/*.graphqls`)
  );
  const extensionsSchemas = extensionsPath ? fileLoader(
    path.join(extensionsPath, `/**/*.graphqls`)
  ) : []
  return rootSchemas.concat(coreSchemas).concat(extensionsSchemas)
}
