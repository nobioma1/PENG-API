const supertest = require('supertest');

const request = supertest(require('../../../api/server'));
const { User } = require('../../../models');

const testUser = {
  name: 'Test User Owner',
  email: 'test_user_owner@email.com',
  password: 'TestPassword',
  imageURL: 'https://linktoimage.com/image.jpg',
  isActive: true,
};

let authUser;

beforeEach(async done => {
  await User.create(testUser);
  const { body } = await request.post('/api/v1/auth/login').send({
    email: testUser.email,
    password: testUser.password,
  });
  authUser = body;
  done();
});

describe('User/', () => {
  describe('User Profile [GET] /api/v1/user', () => {
    it('should get authUser profile', async done => {
      const response = await request
        .get('/api/v1/user')
        .set('Authorization', authUser.token);
      expect(response.status).toBe(200);
      done();
    });
  });
});