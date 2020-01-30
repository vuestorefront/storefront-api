import app from '../../server'
import request from 'supertest';
import { getClient } from '@storefront-api/lib/redis';
import { getClient as esgetClient } from '@storefront-api/lib/elastic';
import config from 'config'

describe('GET /user', () => {
  afterAll(() => {
    const redis = getClient(config.get('redis'))
    if (redis) {
      redis.end()
    }
    const esClint = esgetClient(config)
    if (esClint) {
      esClint.close()
    }
  })

  it('Check that the default api endpoint responses', () => {
    return request(app)
      .get('/api')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
  });

  it('Check the default response form product endpoint', () => {
    return request(app)
      .get('/api/catalog/vue_storefront_catalog/product/_search')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        expect(response.body.hits.hits.length).toEqual(10)
      });
  });

  it('Check that the size parameter works ', () => {
    return request(app)
      .get('/api/catalog/vue_storefront_catalog/product/_search')
      .query({
        size: 50
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        expect(response.body.hits.hits.length).toEqual(50)
      });
  });
});
