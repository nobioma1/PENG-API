const supertest = require('supertest');

const request = supertest(require('../api/server'));
const { User } = require('../models');
const { generateToken } = require('../utils/authToken');

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

describe('User Controller', () => {
  describe('User Profile [GET] /api/v1/user', () => {
    it('should check if user exists', async done => {
      const response = await request.get('/api/v1/user').set(
        'Authorization',
        generateToken({
          sub: '5e07d074f48ad66309eac273',
          email: 'fakeuser@email.com',
        }),
      );
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'User does not exist' });
      done();
    });

    it('should get authUser profile', async done => {
      const response = await request
        .get('/api/v1/user')
        .set('Authorization', authUser.token);
      expect(response.status).toBe(200);
      done();
    });
  });
});
