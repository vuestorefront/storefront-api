import config from 'config';
import es from 'src/lib/elastic'

export default es.getClient(config)
