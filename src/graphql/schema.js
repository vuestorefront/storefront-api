import path from 'path';
import config from 'config';
import { fileLoader, mergeTypes } from 'merge-graphql-schemas';

const rootSchemas = fileLoader(path.join(__dirname, `./${config.server.searchEngine}/*.graphqls`))
const coreSchemas = fileLoader(
  path.join(__dirname, `./${config.server.searchEngine}/**/*.graphqls`)
);
const extensionsSchemas = fileLoader(
  path.join(__dirname, `../api/extensions/**/*.graphqls`)
);
const typesArray = rootSchemas.concat(coreSchemas).concat(extensionsSchemas)

export default mergeTypes(typesArray, { all: true });
