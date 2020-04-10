import TagCache from 'redis-tag-cache'
import config from 'config'
let cache: boolean|TagCache = false

if (config.has('server.useOutputCache') && config.get('server.useOutputCache')) {
  const redisConfig = Object.assign(config.get('redis'))
  cache = new TagCache({
    redis: redisConfig,
    defaultTimeout: config.get('server.outputCacheDefaultTtl')
  })
}

export default cache
