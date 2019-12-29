/* eslint-disable no-underscore-dangle */
const supertest = require('supertest');

const request = supertest(require('../../../api/server'));
const { User, Workspace } = require('../../../models');
const { generateToken } = require('../../../utils/authToken');

const testUser = {
  name: 'Test User Owner',
  email: 'test_user_owner@email.com',
  password: 'TestPassword',
  imageURL: 'https://linktoimage.com/image.jpg',
  isActive: true,
};

let authUser;
let testWorkspace;

beforeEach(async done => {
  await User.create(testUser);
  const { body } = await request.post('/api/v1/auth/login').send({
    email: testUser.email,
    password: testUser.password,
  });
  authUser = body;
  testWorkspace = {
    name: 'Test Workspace',
    owner: body.user._id,
    members: [],
    logoURL: 'https://linktoimage.com/workspace.jpg',
  };
  done();
});

describe('Workspace Middleware', () => {
  describe('Create Workspace [POST] /api/v1/workspace', () => {
    it('should validate request body', async done => {
      const response = await request
        .post('/api/v1/workspace')
        .send({})
        .set('Authorization', authUser.token);
      expect.assertions(2);
      expect(response.status).toBe(400);
      expect(response.body.error).toEqual(
        expect.arrayContaining(['Name is required']),
      );
      done();
    });
  });

  describe('GET Workspace [GET] /api/v1/workspace/:workspaceID', () => {
    it('should check if workspace eits', async done => {
      const response = await request
        .get('/api/v1/workspace/5e06901ddc46bc5c88786d1d')
        .set('Authorization', authUser.token);
      expect.assertions(2);
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: 'Workspace not found',
      });
      done();
    });
  });

  describe('Update Workspace [PUT] /api/v1/workspace/workspaceID', () => {
    it('should check if workspace owner', async done => {
      const workspace = await Workspace.create(testWorkspace);
      const fakeToken = generateToken({
        sub: '5e06901ddc46bc5c88786d1d',
        email: 'notowner@email.com',
      });
      const response = await request
        .put(`/api/v1/workspace/${workspace._id}`)
        .set('Authorization', fakeToken)
        .send(testWorkspace);
      expect.assertions(2);
      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        error: 'You are not authorized to perform this operation',
      });
      done();
    });
  });

  describe('Send Invite tto Workspace [POST] /api/v1/workspace/:workspaceID/invite', () => {
    it('should validate request body', async done => {
      const workspace = await Workspace.create(testWorkspace);
      const response = await request
        .post(`/api/v1/workspace/${workspace._id}/invite`)
        .send({})
        .set('Authorization', authUser.token);
      expect.assertions(2);
      expect(response.status).toBe(400);
      expect(response.body.error).toEqual(
        expect.arrayContaining(['Email Address is required']),
      );
      done();
    });
  });

  describe('Join Workspace [GET] /api/v1/workspace/:workspaceID/join/:token', () => {
    it('should catch error if bad confirmation token is provided', async done => {
      const workspace = await Workspace.create(testWorkspace);
      const token = 'Not an Invitation Token';
      const response = await request
        .get(`/api/v1/workspace/${workspace._id}/join/${token}`)
        .set('Authorization', authUser.token);
      expect.assertions(2);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Invalid Invitation Token',
      });
      done();
    });
  });

  describe('Remove From Workspace [DELETE] /api/v1/workspace/:workspaceID/remove/:userId', () => {
    it('should check if user is a member of workspace', async done => {
      const user = await User.create({
        name: 'Workspace Member',
        email: 'workspacemember@email.com',
        password: 'memberrpassword',
        imageURL: '',
        isActive: true,
      });
      const workspace = await Workspace.create(testWorkspace);
      const response = await request
        .delete(`/api/v1/workspace/${workspace._id}/remove/${user._id}`)
        .set('Authorization', authUser.token);
      expect.assertions(2);
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: 'User is not a member of Workspace',
      });
      done();
    });
  });
});
