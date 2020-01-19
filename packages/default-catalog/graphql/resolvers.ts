import path from 'path';
import config from 'config';
import { loadModuleResolversArray } from '@storefront-api/lib/helpers/graphql'

export default loadModuleResolversArray(path.join(__dirname, `${config.get('server.searchEngine')}`), path.join(__dirname, `../api/extensions`))
