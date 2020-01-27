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
const testWorkspace = {
  name: 'Test Workspace',
  logoURL: 'https://linktoimage.com/workspace.jpg',
};

beforeEach(async done => {
  await User.create(testUser);
  const { body } = await request.post('/api/v1/auth/login').send({
    email: testUser.email,
    password: testUser.password,
  });
  authUser = body;
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
      expect(response.body.error).toEqual({ message: ['Name is required'] });
      done();
    });

    it('should create workspace', async done => {
      const response = await request
        .post('/api/v1/workspace')
        .send(testWorkspace)
        .set('Authorization', authUser.token);

      const userWorkspace = await User.findOne({
        _id: authUser.user._id,
        workspaces: {
          $in: [response.body.workspace._id],
        },
      });

      expect.assertions(4);
      expect(response.status).toBe(201);
      expect(response.body.workspace.name).toEqual(testWorkspace.name);
      expect(response.body.workspace.owner).toEqual(authUser.user._id);
      expect(userWorkspace).not.toBeNull();
      done();
    });
  });

  describe('GET Workspace [GET] /api/v1/workspace/:workspaceID', () => {
    it('should check if workspace exists', async done => {
      const response = await request
        .get('/api/v1/workspace/5e06901ddc46bc5c88786d1d')
        .set('Authorization', authUser.token);
      expect.assertions(2);
      expect(response.status).toBe(404);
      expect(response.body.error).toEqual({
        message: 'Workspace not found',
      });
      done();
    });

    it('should get workspace with id', async done => {
      const workspace = await Workspace.create({
        ...testWorkspace,
        owner: authUser.user._id,
      });
      const response = await request
        .get(`/api/v1/workspace/${workspace._id}`)
        .set('Authorization', authUser.token);
      expect.assertions(3);
      expect(response.status).toBe(200);
      expect(response.body.workspace.name).toEqual(testWorkspace.name);
      expect(response.body.workspace.isAdmin).toBeTruthy();
      done();
    });
  });

  describe('GET User Workspaces [GET] /api/v1/workspace/', () => {
    it('should get user workspaces', async done => {
      const workspaceAdmin = await User.create({
        ...testUser,
        email: 'test_user_admin@email.com',
      });
      await Workspace.create({
        ...testWorkspace,
        owner: authUser.user._id,
        members: [authUser.user._id, workspaceAdmin._id],
      });
      await Workspace.create({
        ...testWorkspace,
        owner: workspaceAdmin._id,
        members: [workspaceAdmin._id, authUser.user._id],
      });
      const response = await request
        .get(`/api/v1/workspace`)
        .set('Authorization', authUser.token);
      expect.assertions(2);
      expect(response.status).toBe(200);
      expect(response.body.workspaces).toHaveLength(2);
      done();
    });
  });

  describe('Update Workspace [PUT] /api/v1/workspace/workspaceID', () => {
    it('should check if workspace owner', async done => {
      const workspace = await Workspace.create({
        ...testWorkspace,
        owner: authUser.user._id,
        members: [authUser.user._id],
      });
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
      expect(response.body.error).toEqual({
        message: 'You are not authorized to perform this operation',
      });
      done();
    });

    it('should update workspace', async done => {
      const workspace = await Workspace.create({
        ...testWorkspace,
        owner: authUser.user._id,
        members: [authUser.user._id],
      });
      await User.findByIdAndUpdate(authUser.user._id, {
        $push: {
          workspaces: workspace._id,
        },
      });
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
        name: 'Kip Workspace',
        owner: '5e06901ddc46bc5c88786d1d',
        members: ['5e06901ddc46bc5c88786d1d'],
      });
      const workspace = await Workspace.create({
        ...testWorkspace,
        owner: authUser.user._id,
        members: [authUser.user._id],
      });
      await User.findByIdAndUpdate(authUser.user._id, {
        $push: {
          workspaces: workspace._id,
        },
      });
      const response = await request
        .delete(`/api/v1/workspace/${workspace._id}`)
        .set('Authorization', authUser.token);
      const workspaces = await Workspace.find().lean();
      expect.assertions(4);
      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
      expect(workspaces.length).toBe(1);
      expect(workspaces[0].name).toBe('Kip Workspace');
      done();
    });
  });

  describe('Send Invite to Workspace [POST] /api/v1/workspace/:workspaceID/invite', () => {
    it('should validate request body', async done => {
      const workspace = await Workspace.create({
        ...testWorkspace,
        owner: authUser.user._id,
        members: [authUser.user._id],
      });
      await User.findByIdAndUpdate(authUser.user._id, {
        $push: {
          workspaces: workspace._id,
        },
      });
      const response = await request
        .post(`/api/v1/workspace/${workspace._id}/invite`)
        .send({})
        .set('Authorization', authUser.token);
      expect.assertions(2);
      expect(response.status).toBe(400);
      expect(response.body.error).toEqual({
        message: ['Email Address is required'],
      });
      done();
    });

    it('should invite user to workspace', async done => {
      const email = 'inviteuser@email.com';
      const workspace = await Workspace.create({
        ...testWorkspace,
        owner: authUser.user._id,
        members: [authUser.user._id],
      });
      await User.findByIdAndUpdate(authUser.user._id, {
        $push: {
          workspaces: workspace._id,
        },
      });

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

    it('should not invite already invited user', async done => {
      const email = 'inviteuser@email.com';
      const workspace = await Workspace.create({
        ...testWorkspace,
        owner: authUser.user._id,
        members: [authUser.user._id],
      });

      await User.findByIdAndUpdate(authUser.user._id, {
        $push: {
          workspaces: workspace._id,
        },
      });

      await request
        .post(`/api/v1/workspace/${workspace._id}/invite`)
        .send({ email })
        .set('Authorization', authUser.token);

      const response = await request
        .post(`/api/v1/workspace/${workspace._id}/invite`)
        .send({ email })
        .set('Authorization', authUser.token);

      expect.assertions(2);
      expect(response.status).toBe(400);
      expect(response.body.error).toEqual({
        message: `User with email ${email} has been invited already`,
      });
      done();
    });

    it('should not invite member to workspace', async done => {
      const workspace = await Workspace.create({
        ...testWorkspace,
        owner: authUser.user._id,
        members: [authUser.user._id],
      });

      await User.findByIdAndUpdate(authUser.user._id, {
        $push: {
          workspaces: workspace._id,
        },
      });

      const response = await request
        .post(`/api/v1/workspace/${workspace._id}/invite`)
        .send({ email: testUser.email })
        .set('Authorization', authUser.token);

      expect.assertions(2);
      expect(response.status).toBe(400);
      expect(response.body.error).toEqual({
        message: `User with email ${testUser.email} is already a member of workspace.`,
      });
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
      const workspace = await Workspace.create({
        ...testWorkspace,
        owner: authUser.user._id,
        members: [authUser.user._id],
      });
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

      expect.assertions(5);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: `User "${user.name}" has been added to "${workspace.name}"`,
      });
      expect(joinedUser.workspaces).toHaveLength(1);
      expect(joinedWorkspace.members).toHaveLength(2);
      expect(joinedUser.workspaces[0]).toEqual(workspace._id);
      done();
    });

    it('should catch error with invite token', async done => {
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
      const token = 'Bad Invite Token';
      const workspace = await Workspace.create({
        ...testWorkspace,
        owner: authUser.user._id,
        members: [authUser.user._id],
      });
      const response = await request
        .get(`/api/v1/workspace/${workspace._id}/join/${token}`)
        .set('Authorization', userLogin.body.token);

      expect.assertions(2);
      expect(response.status).toBe(400);
      expect(response.body.error).toEqual({
        message: 'Invalid Invitation Token',
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
      const workspace = await Workspace.create({
        ...testWorkspace,
        owner: authUser.user._id,
        members: [authUser.user._id],
      });
      await User.findByIdAndUpdate(authUser.user._id, {
        $push: {
          workspaces: workspace._id,
        },
      });
      const response = await request
        .delete(`/api/v1/workspace/${workspace._id}/remove/${user._id}`)
        .set('Authorization', authUser.token);
      expect.assertions(2);
      expect(response.status).toBe(404);
      expect(response.body.error).toEqual({
        message: 'User is not a member of Workspace',
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
      const workspace = await Workspace.create({
        ...testWorkspace,
        owner: authUser.user._id,
        members: [authUser.user._id],
      });
      await User.findByIdAndUpdate(authUser.user._id, {
        $push: {
          workspaces: workspace._id,
        },
      });
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
        message: `User "${user.name}" has been removed from "${workspace.name}"`,
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
      const workspace = await Workspace.create({
        ...testWorkspace,
        owner: authUser.user._id,
        members: [authUser.user._id, user._id],
      });
      await User.findByIdAndUpdate(authUser.user._id, {
        $push: {
          workspaces: workspace._id,
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

    it('owner should not leave workspace', async done => {
      const workspace = await Workspace.create({
        ...testWorkspace,
        owner: authUser.user._id,
        members: [authUser.user._id],
      });
      await User.findByIdAndUpdate(authUser.user._id, {
        $push: {
          workspaces: workspace._id,
        },
      });
      const response = await request
        .delete(`/api/v1/workspace/${workspace._id}/leave`)
        .set('Authorization', authUser.token);

      expect.assertions(2);
      expect(response.status).toBe(400);
      expect(response.body.error).toEqual({
        message: 'Workspace Admin can not leave Workspace',
      });
      done();
    });
  });
});
