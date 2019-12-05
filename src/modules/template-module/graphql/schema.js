import path from 'path';
import config from 'config';
import { loadModuleSchemaArray } from 'src/lib/helpers/graphql'

export default loadModuleSchemaArray(__dirname, `./${config.server.searchEngine}`, path.join(__dirname, `../api/extensions`))
