import path from 'path';
import config from 'config';
import { loadModuleSchemaArray } from '@storefront-api/lib/helpers/graphql'

export default loadModuleSchemaArray(__dirname, `./${config.server.searchEngine}`, path.join(__dirname, `../api/extensions`))
