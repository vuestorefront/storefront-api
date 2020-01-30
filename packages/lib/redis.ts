import Redis from 'redis'
import { RedisClient } from 'redis';

let redisClient: RedisClient|boolean = false;

/**
 * Return Redis Client
 * @param {config} config
 */
export function getClient (config): RedisClient {
  if (redisClient instanceof RedisClient) {
    return redisClient
  }

  redisClient = Redis.createClient(config.redis); // redis client

  redisClient.on('error', (err) => { // workaround for https://github.com/NodeRedis/node_redis/issues/713
    redisClient = Redis.createClient(config.redis); // redis client
  });

  if (config.redis.auth) {
    redisClient.auth(config.redis.auth);
  }

  return redisClient
}
