import path from 'path';
import config from 'config';
import { fileLoader, mergeResolvers } from 'merge-graphql-schemas';

const rootResolvers = fileLoader(path.join(__dirname, `./${config.server.searchEngine}/*.resolver.js`))
const coreResolvers = fileLoader(
  path.join(__dirname, `./${config.server.searchEngine}/**/resolver.js`)
);
const extensionsResolvers = fileLoader(
  path.join(__dirname, `../api/extensions/**/resolver.js`)
);
const resolversArray = rootResolvers.concat(coreResolvers).concat(extensionsResolvers)

export default mergeResolvers(resolversArray, { all: true });
