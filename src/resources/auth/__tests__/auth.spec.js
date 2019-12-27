const supertest = require('supertest');
const Crypto = require('crypto');

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

describe('Auth/', () => {
  describe('Signup [POST] /api/v1/auth/signup', () => {
    it('should validate request body', async () => {
      const response = await request.post('/api/v1/auth/signup').send({});
      expect.assertions(3);
      expect(response.status).toBe(400);
      expect(response.body.error).toHaveLength(4);
      expect(response.body.error).toEqual(
        expect.arrayContaining([
          'Name is required',
          'Email Address is required',
          'Password is required',
          'Confirm Password is required',
        ]),
      );
    });

    it('should check if passwords match', async () => {
      const response = await request.post('/api/v1/auth/signup').send({
        ...testUser,
        confirmPassword: 'wrongMatch',
      });
      expect.assertions(2);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Passwords does not match',
      });
    });

    it('should create user', async () => {
      const response = await request.post('/api/v1/auth/signup').send(testUser);
      expect.assertions(10);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('_id');
      expect(response.body.user).toHaveProperty('isActive');
      expect(response.body.user).toHaveProperty('workspaces');
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body.user.name).toBe(testUser.name);
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.imageURL).toBe(testUser.imageURL);
    });

    it('should not create user with existing email', async () => {
      await request.post('/api/v1/auth/signup').send(testUser);
      const response = await request.post('/api/v1/auth/signup').send(testUser);
      expect.assertions(2);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'User with Email Address already exists',
      });
    });
  });

  describe('Login [POST] /api/v1/auth/login', () => {
    it('should validate request body', async () => {
      const response = await request.post('/api/v1/auth/login').send({});
      expect.assertions(3);
      expect(response.status).toBe(400);
      expect(response.body.error).toHaveLength(2);
      expect(response.body.error).toEqual(
        expect.arrayContaining([
          'Email Address is required',
          'Password is required',
        ]),
      );
    });

    it('should check if user with email exits', async () => {
      const response = await request.post('/api/v1/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });
      expect.assertions(2);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'User with email does not exist',
      });
    });

    it('should Login user', async () => {
      await request.post('/api/v1/auth/signup').send(testUser);
      const response = await request.post('/api/v1/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });
      expect.assertions(10);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('_id');
      expect(response.body.user).toHaveProperty('isActive');
      expect(response.body.user).toHaveProperty('workspaces');
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body.user.name).toBe(testUser.name);
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.imageURL).toBe(testUser.imageURL);
    });
  });

  describe('Verify User [GET] /api/v1/confirm_user/:token', () => {
    it('should validate confirmation token if valid token is provided', async () => {
      const token = encrypt(Crypto.randomBytes(20).toString('hex'));
      const response = await request.get(`/api/v1/auth/confirm_user/${token}`);
      expect.assertions(2);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Cannot Confirm user, Invalid or Expired Token',
      });
    });

    it('should catch error if bad confirmation token is provided', async () => {
      const token = 'Not a confirmation Token';
      const response = await request.get(`/api/v1/auth/confirm_user/${token}`);
      expect.assertions(2);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Invalid Token',
      });
    });

    it('should verify User', async () => {
      await request.post('/api/v1/auth/signup').send(testUser);
      const [verify] = await VerifyToken.find().lean();
      const token = encrypt(verify.token);
      const verifyResponse = await request.get(
        `/api/v1/auth/confirm_user/${token}`,
      );
      const userResponse = await request.post('/api/v1/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });
      expect.assertions(3);
      expect(verifyResponse.status).toBe(200);
      expect(verifyResponse.body).toEqual({
        message: `User with email '${testUser.email} confirmed`,
      });
      expect(userResponse.body.user.isActive).toBeTruthy();
    });
  });

  describe('Forgot Password [POST] /api/v1/auth/forgot_password', () => {
    it('should validate request body, email is required', async () => {
      const response = await request
        .post(`/api/v1/auth/forgot_password`)
        .send({});
      expect.assertions(3);
      expect(response.status).toBe(400);
      expect(response.body.error).toHaveLength(1);
      expect(response.body.error).toEqual(
        expect.arrayContaining(['Email Address is required']),
      );
    });

    it('should check if user email exists', async () => {
      const response = await request
        .post(`/api/v1/auth/forgot_password`)
        .send({ email: 'wrongtestuser@email.com' });
      expect.assertions(2);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'User with email does not exist',
      });
    });

    it('should create token for forgot password', async () => {
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
    });
  });

  describe('Reset Password [POST] /api/v1/auth/reset_password/:token', () => {
    it('should validate request body', async () => {
      const response = await request
        .post(`/api/v1/auth/reset_password/5e0652b937e89614f14aac18`)
        .send({});
      expect.assertions(3);
      expect(response.status).toBe(400);
      expect(response.body.error).toHaveLength(3);
      expect(response.body.error).toEqual(
        expect.arrayContaining([
          'Old Password is required',
          'New Password is required',
          'Confirm New Password is required',
        ]),
      );
    });

    it('should catch error if bad reset token is provided', async () => {
      const token = 'Not a reset Token';
      const response = await request
        .post(`/api/v1/auth/reset_password/${token}`)
        .send(testUserReset);
      expect.assertions(2);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Invalid Token',
      });
    });

    it('should validate reset token if valid token is provided', async () => {
      const token = encrypt(Crypto.randomBytes(20).toString('hex'));
      const response = await request
        .post(`/api/v1/auth/reset_password/${token}`)
        .send(testUserReset);
      expect.assertions(2);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Cannot Reset Password, Invalid or Expired Token',
      });
    });

    it('should confirm if old password match', async () => {
      await request.post('/api/v1/auth/signup').send(testUser);
      await request
        .post(`/api/v1/auth/forgot_password`)
        .send({ email: testUser.email });
      const [reset] = await PasswordReset.find().lean();
      const token = encrypt(reset.token);
      const response = await request
        .post(`/api/v1/auth/reset_password/${token}`)
        .send({
          ...testUserReset,
          oldPassword: 'NotAMatchToOldPassword',
        });
      expect.assertions(2);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Password does not match',
      });
    });

    it('should confirm if passwords match', async () => {
      await request.post('/api/v1/auth/signup').send(testUser);
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
      expect(response.body).toEqual({
        error: 'Passwords does not match',
      });
    });

    it('should validate provided token is for a valid user', async () => {
      await request.post('/api/v1/auth/signup').send(testUser);
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
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Cannot Reset Password, Invalid User',
      });
    });

    it('should change user password', async () => {
      await request.post('/api/v1/auth/signup').send(testUser);
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
    });
  });

  describe('Resend Verify [GET] /api/v1/auth/resend_verify', () => {
    it('should require Authorization token', async () => {
      const response = await request.get(`/api/v1/auth/resend_verify`);
      expect.assertions(2);
      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        error: 'Provide a valid authorization token',
      });
    });

    it('should check if user is already active', async () => {
      const userRes = await request.post('/api/v1/auth/signup').send(testUser);
      await User.findByIdAndUpdate(
        // eslint-disable-next-line no-underscore-dangle
        userRes.body.user._id,
        { isActive: true },
      ).lean();
      const response = await request
        .get(`/api/v1/auth/resend_verify`)
        .set('Authorization', userRes.body.token);
      expect.assertions(2);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'User is already active',
      });
    });

    it('should resend verification token', async () => {
      const userRes = await request.post('/api/v1/auth/signup').send(testUser);
      const response = await request
        .get(`/api/v1/auth/resend_verify`)
        .set('Authorization', userRes.body.token);
      expect.assertions(2);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: `Verification token resent to ${userRes.body.user.email}`,
      });
    });
  });
});
