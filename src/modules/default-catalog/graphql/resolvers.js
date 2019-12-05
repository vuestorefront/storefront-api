import path from 'path';
import config from 'config';
import { loadModuleResolversArray } from 'src/lib/helpers/graphql'

export default loadModuleResolversArray(path.join(__dirname, `${config.server.searchEngine}`), path.join(__dirname, `../api/extensions`))
