import app from '../../server'
import request from 'supertest';

describe('GET /user', () => {
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
