const request = require('supertest');

const server = require('./server');

describe('Server', () => {
  describe('[GET] /', () => {
    it('should return status code 200', async () => {
      const response = await request(server).get('/');
      expect.assertions(1);
      expect(response.status).toBe(200);
    });
    it('should return response json', async () => {
      const response = await request(server).get('/');
      expect.assertions(1);
      expect(response.body).toEqual({
        message: `Welcome to Peng API`,
      });
    });
  });
});
