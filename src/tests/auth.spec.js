const supertest = require('supertest');
const Crypto = require('crypto');

const request = supertest(require('../api/server'));
const { encrypt } = require('../utils/encrypt-decrypt');
const { VerifyToken, PasswordReset, User } = require('../models');

const testUser = {
  name: 'Test User',
  email: 'test_user@email.com',
  password: 'TestPassword',
  confirmPassword: 'TestPassword',
  imageURL: 'https://linktoimage.com/image.jpg',
};

const testUserReset = {
  newPassword: 'SomethingTestPassword',
  confirmNewPassword: 'SomethingTestPassword',
};

describe('Auth Controller', () => {
  describe('Signup [POST] /api/v1/auth/signup', () => {
    it('should validate request body', async done => {
      const response = await request.post('/api/v1/auth/signup').send({});
      expect.assertions(2);
      expect(response.status).toBe(400);
      expect(response.body.error).toEqual({
        message: [
          'Name is required',
          'Email Address is required',
          'Password is required',
          'confirmPassword is required',
        ],
      });
      done();
    });

    it('should check if passwords match', async done => {
      const response = await request.post('/api/v1/auth/signup').send({
        ...testUser,
        confirmPassword: 'wrongMatch',
      });
      expect.assertions(2);
      expect(response.status).toBe(400);
      expect(response.body.error).toEqual({
        message: ['confirmPassword must be refpassword'],
      });
      done();
    });

    it('should not create user with existing email', async done => {
      await User.create(testUser);
      const response = await request.post('/api/v1/auth/signup').send(testUser);
      expect.assertions(2);
      expect(response.status).toBe(400);
      expect(response.body.error).toEqual({
        message: 'Email Address already exists',
      });
      done();
    });

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
    it('should validate request body', async done => {
      const response = await request.post('/api/v1/auth/login').send({});
      expect.assertions(2);
      expect(response.status).toBe(400);
      expect(response.body.error).toEqual({
        message: ['Email Address is required', 'Password is required'],
      });
      done();
    });

    it('should check if user with email exits', async done => {
      const response = await request.post('/api/v1/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });
      expect.assertions(2);
      expect(response.status).toBe(400);
      expect(response.body.error).toEqual({
        message: 'User with email does not exist',
      });
      done();
    });

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
    it('should validate confirmation token if valid token is provided', async done => {
      const token = encrypt(Crypto.randomBytes(20).toString('hex'));
      const response = await request.get(`/api/v1/auth/confirm_user/${token}`);
      expect.assertions(2);
      expect(response.status).toBe(400);
      expect(response.body.error).toEqual({
        message: 'Cannot Confirm user, Invalid or Expired Token',
      });
      done();
    });

    it('should catch error if bad confirmation token is provided', async done => {
      const token = 'Not a Confirmation Token';
      const response = await request.get(`/api/v1/auth/confirm_user/${token}`);
      expect.assertions(2);
      expect(response.status).toBe(400);
      expect(response.body.error).toEqual({
        message: 'Invalid Confirm Token',
      });
      done();
    });

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
    it('should validate request body, email is required', async done => {
      const response = await request
        .post(`/api/v1/auth/forgot_password`)
        .send({});
      expect.assertions(2);
      expect(response.status).toBe(400);
      expect(response.body.error).toEqual({
        message: ['Email Address is required'],
      });
      done();
    });

    it('should check if user email exists', async done => {
      const response = await request
        .post(`/api/v1/auth/forgot_password`)
        .send({ email: 'wrongtestuser@email.com' });
      expect.assertions(2);
      expect(response.status).toBe(400);
      expect(response.body.error).toEqual({
        message: 'User with email does not exist',
      });
      done();
    });

    it('should create token for forgot password', async done => {
      const signupRes = await request
        .post('/api/v1/auth/signup')
        .send(testUser);
      const response = await request
        .post(`/api/v1/auth/forgot_password`)
        .send({ email: testUser.email });
      const reset = await PasswordReset.findOne({
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

    it('should validate request body', async done => {
      const response = await request
        .post(`/api/v1/auth/reset_password/5e0652b937e89614f14aac18`)
        .send({});
      expect.assertions(2);
      expect(response.status).toBe(400);
      expect(response.body.error).toEqual({
        message: ['New Password is required', 'confirmNewPassword is required'],
      });
      done();
    });

    it('should catch error if bad reset token is provided', async done => {
      const token = 'Not a reset Token';
      const response = await request
        .post(`/api/v1/auth/reset_password/${token}`)
        .send(testUserReset);
      expect.assertions(2);
      expect(response.status).toBe(400);
      expect(response.body.error).toEqual({
        message: 'Invalid Reset Token',
      });
      done();
    });

    it('should validate reset token if valid token is provided', async done => {
      const token = encrypt(Crypto.randomBytes(20).toString('hex'));
      const response = await request
        .post(`/api/v1/auth/reset_password/${token}`)
        .send(testUserReset);
      expect.assertions(2);
      expect(response.status).toBe(400);
      expect(response.body.error).toEqual({
        message: 'Cannot Reset Password, Invalid or Expired Token',
      });
      done();
    });

    it('should confirm if passwords match', async done => {
      await User.create(testUser);
      await request
        .post(`/api/v1/auth/forgot_password`)
        .send({ email: testUser.email });
      const [reset] = await PasswordReset.find().lean();
      const token = encrypt(reset.token);
      const response = await request
        .post(`/api/v1/auth/reset_password/${token}`)
        .send({
          ...testUserReset,
          confirmNewPassword: 'NotAMatchToNewPassword',
        });
      expect.assertions(2);
      expect(response.status).toBe(400);
      expect(response.body.error).toEqual({
        message: ['confirmNewPassword must be refnewPassword'],
      });
      done();
    });

    it('should validate provided token is for a valid user', async done => {
      await User.create(testUser);
      await request
        .post(`/api/v1/auth/forgot_password`)
        .send({ email: testUser.email });
      await User.deleteMany();
      const [reset] = await PasswordReset.find().lean();
      const token = encrypt(reset.token);
      const response = await request
        .post(`/api/v1/auth/reset_password/${token}`)
        .send(testUserReset);
      expect.assertions(2);
      expect(response.status).toBe(404);
      expect(response.body.error).toEqual({
        message: 'Cannot Reset Password, Invalid User',
      });
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

    it('should require Authorization token', async done => {
      const response = await request.get(`/api/v1/auth/resend_verify`);
      expect.assertions(2);
      expect(response.status).toBe(401);
      expect(response.body.error).toEqual({
        message: 'Provide a valid authorization token',
      });
      done();
    });

    it('should check if user is already active', async done => {
      const userRes = await request.post('/api/v1/auth/signup').send(testUser);
      await User.findByIdAndUpdate(userRes.body.user._id, {
        isActive: true,
      }).lean();
      const response = await request
        .get(`/api/v1/auth/resend_verify`)
        .set('Authorization', userRes.body.token);
      expect.assertions(2);
      expect(response.status).toBe(400);
      expect(response.body.error).toEqual({
        message: 'User is already active',
      });
      done();
    });
  });
});
