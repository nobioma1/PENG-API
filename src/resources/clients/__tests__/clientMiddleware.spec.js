const supertest = require('supertest');

const request = supertest(require('../../../api/server'));
const { User, Workspace, Client } = require('../../../models');

const testUser = {
  name: 'Test User Owner',
  email: 'test_user_owner@email.com',
  password: 'TestPassword',
  imageURL: 'https://linktoimage.com/image.jpg',
  isActive: true,
};

const testClient = {
  name: 'Test Client',
  address: 'No. 1 Test Environment, Jest',
  contacts: [
    {
      type: 'mobile',
      contact: '03283746834',
    },
  ],
  imageURL: 'https://linktoimage.com/client.jpg',
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
  testWorkspace = await Workspace.create({
    name: 'Test Workspace',
    owner: body.user._id,
    members: [],
    clients: [],
    logoURL: 'https://linktoimage.com/workspace.jpg',
  });
  done();
});

describe('Client Middleware', () => {
  describe('Add Client [POST] /api/v1/workspace/:workspaceID/client', () => {
    it('should validate request body to create client', async done => {
      const response = await request
        .post(`/api/v1/workspace/${testWorkspace._id}/client`)
        .send({})
        .set('Authorization', authUser.token);
      expect.assertions(2);
      expect(response.status).toBe(400);
      expect(response.body.error).toEqual(
        expect.arrayContaining(['Name is required']),
      );
      done();
    });

    it('should check if client is already created in workspace', async done => {
      const client = await Client.create({
        ...testClient,
        workspace: testWorkspace._id,
      });
      await Workspace.findByIdAndUpdate(testWorkspace._id, {
        $push: {
          clients: client._id,
        },
      });
      const response = await request
        .post(`/api/v1/workspace/${testWorkspace._id}/client`)
        .send(testClient)
        .set('Authorization', authUser.token);
      expect.assertions(2);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Client with Name already exists',
      });
      done();
    });
  });
});
