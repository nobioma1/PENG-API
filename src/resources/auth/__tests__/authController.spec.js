const supertest = require('supertest');

const request = supertest(require('../../../api/server'));
const { encrypt } = require('../../../utils/encrypt-decrypt');
const { VerifyToken, PasswordReset, User } = require('../../../models');

const testUser = {
  name: 'Test User',
  email: 'test_user@email.com',
  password: 'TestPassword',
  confirmPassword: 'TestPassword',
  imageURL: 'https://linktoimage.com/image.jpg',
};

const testUserReset = {
  oldPassword: 'TestPassword',
  newPassword: 'SomethingTestPassword',
  confirmNewPassword: 'SomethingTestPassword',
};

describe('Auth Controller', () => {
  describe('Signup [POST] /api/v1/auth/signup', () => {
    it('should create user', async done => {
      const response = await request.post('/api/v1/auth/signup').send(testUser);
      expect.assertions(6);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('isActive');
      expect(response.body.user).toHaveProperty('workspaces');
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body.user.email).toBe(testUser.email);
      done();
    });
  });

  describe('Login [POST] /api/v1/auth/login', () => {
    it('should Login user', async done => {
      await User.create(testUser);
      const response = await request.post('/api/v1/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });
      expect.assertions(6);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('isActive');
      expect(response.body.user).toHaveProperty('workspaces');
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body.user.name).toBe(testUser.name);
      done();
    });
  });

  describe('Verify User [GET] /api/v1/confirm_user/:token', () => {
    it('should verify User', async done => {
      await request.post('/api/v1/auth/signup').send(testUser);
      const [verify] = await VerifyToken.find().lean();
      const token = encrypt(verify.token);
      const verifyResponse = await request.get(
        `/api/v1/auth/confirm_user/${token}`,
      );
      const user = await User.findById(verify.userId).lean();
      expect.assertions(3);
      expect(verifyResponse.status).toBe(200);
      expect(verifyResponse.body).toEqual({
        message: `User with email '${testUser.email} confirmed`,
      });
      expect(user.isActive).toBeTruthy();
      done();
    });
  });

  describe('Forgot Password [POST] /api/v1/auth/forgot_password', () => {
    it('should create token for forgot password', async done => {
      const signupRes = await request
        .post('/api/v1/auth/signup')
        .send(testUser);
      const response = await request
        .post(`/api/v1/auth/forgot_password`)
        .send({ email: testUser.email });
      const reset = await PasswordReset.findOne({
        // eslint-disable-next-line no-underscore-dangle
        userId: signupRes.body.user._id,
      }).lean();
      expect.assertions(3);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: `Password reset email sent to '${testUser.email}' 📨.`,
      });
      expect(reset).not.toBeNull();
      done();
    });
  });

  describe('Reset Password [POST] /api/v1/auth/reset_password/:token', () => {
    it('should change user password', async done => {
      await User.create(testUser);
      await request
        .post(`/api/v1/auth/forgot_password`)
        .send({ email: testUser.email });
      const [reset] = await PasswordReset.find().lean();
      const token = encrypt(reset.token);
      const response = await request
        .post(`/api/v1/auth/reset_password/${token}`)
        .send(testUserReset);
      const loginRes = await request.post('/api/v1/auth/login').send({
        email: testUser.email,
        password: testUserReset.newPassword,
      });
      expect.assertions(3);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Password Updated',
      });
      expect(loginRes.status).toBe(200);
      done();
    });
  });

  describe('Resend Verify [GET] /api/v1/auth/resend_verify', () => {
    it('should resend verification token', async done => {
      const userRes = await request.post('/api/v1/auth/signup').send(testUser);
      const response = await request
        .get(`/api/v1/auth/resend_verify`)
        .set('Authorization', userRes.body.token);
      expect.assertions(2);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: `Verification token resent to ${userRes.body.user.email}`,
      });
      done();
    });
  });
});
