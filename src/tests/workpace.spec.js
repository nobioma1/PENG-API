const supertest = require('supertest');
const Crypto = require('crypto');

const request = supertest(require('../api/server'));
const { User, Workspace, WorkspaceInvite } = require('../models');
const { encrypt } = require('../utils/encrypt-decrypt');
const { generateToken } = require('../utils/authToken');

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

describe('Workspace Controller', () => {
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

    it('should create workspace', async done => {
      const response = await request
        .post('/api/v1/workspace')
        .send({ name: testWorkspace.name })
        .set('Authorization', authUser.token);
      expect.assertions(3);
      expect(response.status).toBe(201);
      expect(response.body.workspace.name).toEqual(testWorkspace.name);
      expect(response.body.workspace.owner).toEqual(testWorkspace.owner);
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

    it('should get workspace with id', async done => {
      const workspace = await Workspace.create(testWorkspace);
      const response = await request
        .get(`/api/v1/workspace/${workspace._id}`)
        .set('Authorization', authUser.token);
      expect.assertions(2);
      expect(response.status).toBe(200);
      expect(response.body.workspace.name).toEqual(testWorkspace.name);
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

    it('should update workspace', async done => {
      const workspace = await Workspace.create(testWorkspace);
      const response = await request
        .put(`/api/v1/workspace/${workspace._id}`)
        .set('Authorization', authUser.token)
        .send({
          name: 'Updated Test Name',
        });
      expect.assertions(2);
      expect(response.status).toBe(200);
      expect(response.body.workspace.name).toEqual('Updated Test Name');
      done();
    });
  });

  describe('Delete Workspace [DELETE] /api/v1/workspace/workspaceID', () => {
    it('should delete workspace', async done => {
      await Workspace.create({
        ...testWorkspace,
        name: 'Kip Workspace',
      });
      const workspace = await Workspace.create(testWorkspace);
      const response = await request
        .delete(`/api/v1/workspace/${workspace._id}`)
        .set('Authorization', authUser.token);
      expect.assertions(2);
      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
      done();
    });
  });

  describe('Send Invite to Workspace [POST] /api/v1/workspace/:workspaceID/invite', () => {
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

    it('should invite user to workspace', async done => {
      const email = 'inviteuser@email.com';
      const workspace = await Workspace.create(testWorkspace);
      const response = await request
        .post(`/api/v1/workspace/${workspace._id}/invite`)
        .send({ email })
        .set('Authorization', authUser.token);
      const invite = await WorkspaceInvite.findOne({ email }).lean();
      expect.assertions(4);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: `Invite has been sent to ${email}`,
      });
      expect(invite.email).toEqual(email);
      expect(invite.token).not.toBeNull();
      done();
    });
  });

  describe('Join Workspace [GET] /api/v1/workspace/:workspaceID/join/:token', () => {
    it('should validate valid invitation token and add user to workspace', async done => {
      const user = await User.create({
        name: 'Workspace Member',
        email: 'workspacemember@email.com',
        password: 'memberrpassword',
        imageURL: '',
        isActive: true,
      });
      const userLogin = await request.post('/api/v1/auth/login').send({
        email: user.email,
        password: 'memberrpassword',
      });
      const iToken = Crypto.randomBytes(20).toString('hex');
      const workspace = await Workspace.create(testWorkspace);
      await WorkspaceInvite.create({
        email: user.email,
        workspace: workspace._id,
        token: iToken,
      });
      const token = encrypt(iToken);
      const response = await request
        .get(`/api/v1/workspace/${workspace._id}/join/${token}`)
        .set('Authorization', userLogin.body.token);
      const joinedUser = await User.findById(user._id).lean();
      const joinedWorkspace = await Workspace.findById(workspace._id).lean();
      expect.assertions(6);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: `User "${user.name}" has been added to ${workspace.name}`,
      });
      expect(joinedUser.workspaces).toHaveLength(1);
      expect(joinedWorkspace.members).toHaveLength(1);
      expect(joinedUser.workspaces[0]).toEqual(workspace._id);
      expect(joinedWorkspace.members[0]).toEqual(user._id);
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

    it('should remove member from workspace', async done => {
      const user = await User.create({
        name: 'Workspace Member',
        email: 'workspacemember@email.com',
        password: 'memberrpassword',
        imageURL: '',
        isActive: true,
      });
      const workspace = await Workspace.create(testWorkspace);
      await Workspace.findByIdAndUpdate(workspace._id, {
        $push: {
          members: user._id,
        },
      });
      await User.findByIdAndUpdate(user._id, {
        $push: {
          workspaces: workspace._id,
        },
      });
      const response = await request
        .delete(`/api/v1/workspace/${workspace._id}/remove/${user._id}`)
        .set('Authorization', authUser.token);
      expect.assertions(2);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: `User "${user.name}" has been removed from ${workspace.name}`,
      });
      done();
    });
  });

  describe('Leave Workspace [DELETE] /api/v1/workspace/:workspaceID/leave/', () => {
    it('should leave workspace', async done => {
      const user = await User.create({
        name: 'Workspace Member',
        email: 'workspacemember@email.com',
        password: 'memberrpassword',
        imageURL: '',
        isActive: true,
      });
      const workspace = await Workspace.create(testWorkspace);
      await Workspace.findByIdAndUpdate(workspace._id, {
        $push: {
          members: user._id,
        },
      });
      await User.findByIdAndUpdate(user._id, {
        $push: {
          workspaces: workspace._id,
        },
      });
      const userLogin = await request.post('/api/v1/auth/login').send({
        email: user.email,
        password: 'memberrpassword',
      });
      const response = await request
        .delete(`/api/v1/workspace/${workspace._id}/leave`)
        .set('Authorization', userLogin.body.token);
      expect.assertions(2);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: `${user.name}, You have left ${workspace.name} workspace`,
      });
      done();
    });
  });
});
