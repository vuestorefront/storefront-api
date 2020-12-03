import config from 'config';
import * as es from '@storefront-api/lib/elastic'

export default es.getClient(config)
