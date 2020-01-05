const request = require('supertest');

const server = require('../api/server');

describe('Server', () => {
  describe('[GET] /', () => {
    it('should return response json with status', async done => {
      const response = await request(server).get('/');
      expect.assertions(2);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Welcome to PENG API',
      });
      done();
    });
    it('should return status code 200 for API status', async done => {
      const response = await request(server).get('/status');
      expect.assertions(1);
      expect(response.status).toBe(200);
      done();
    });
  });
});
