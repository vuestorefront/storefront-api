import config from 'config';
import es from '@storefront-api/lib/elastic'

export default es.getClient(config)
