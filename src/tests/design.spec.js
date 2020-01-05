const supertest = require('supertest');

const request = supertest(require('../api/server'));
const { User, Workspace, Client } = require('../models');

const testUser = {
  name: 'Test User Owner',
  email: 'test_user_owner@email.com',
  password: 'TestPassword',
  imageURL: 'https://linktoimage.com/image.jpg',
  isActive: true,
};

const testDesign = {
  name: 'Test Design',
  designType: 'unisex',
  color: 'dodgerBlue',
  images: [
    'https://linktoimage.com/image1.jpg',
    'https://linktoimage.com/image2.jpg',
    'https://linktoimage.com/image3.jpg',
  ],
  client: null,
  measurement: {
    shoulder: 20,
    aroundArm: 15,
    sleeve: 31,
    cuff: 42,
    neck: 5,
    topLength: 40,
    seatWaist: 10,
    thigh: 11,
    trouserLength: 43,
    bar: 12,
    chest: 13,
    burst: 12,
    dressLength: 10,
    shoulderToUnderBurst: 8,
    shoulderToWaist: 13,
    waist: 62,
    hips: 82,
    skirtLength: 80,
  },
  notes: 'This is a very long not, but short in a way.',
};

let authUser;
let testWorkspace;
let testClient;

beforeEach(async done => {
  await User.create(testUser); // create user in db
  // login user to get auth Token
  const { body } = await request.post('/api/v1/auth/login').send({
    email: testUser.email,
    password: testUser.password,
  });
  authUser = body;
  // Create workspace
  testWorkspace = await Workspace.create({
    name: 'Test Workspace',
    owner: body.user._id,
    members: [body.user._id],
    clients: [],
    logoURL: 'https://linktoimage.com/workspace.jpg',
  });
  // create client
  testClient = await Client.create({
    name: 'Test Client',
    address: 'No. 1 Test Environment, Jest',
    contacts: [
      {
        type: 'mobile',
        contact: '03283746834',
      },
    ],
    imageURL: 'https://linktoimage.com/client.jpg',
    workspace: testWorkspace._id,
  });
  // Add newly created client to workspace's client
  await Workspace.findByIdAndUpdate(testWorkspace._id, {
    $push: {
      clients: testClient._id,
    },
  });
  done();
});

describe('Design Controller', () => {
  describe('Add Design [POST] /api/v1/workspace/:workspaceID/design', () => {
    it('Should check if client is in workspace', async done => {
      const workspace = await Workspace.create({
        name: 'No Client Workspace',
        owner: authUser.user._id,
        members: [authUser.user._id],
        clients: [],
        logoURL: 'https://linktoimage.com/workspace.jpg',
      });
      const response = await request
        .post(`/api/v1/workspace/${workspace._id}/design`)
        .send({
          ...testDesign,
          client: testClient._id,
        })
        .set('Authorization', authUser.token);
      expect.assertions(2);
      expect(response.status).toBe(404);
      expect(response.body.error).toEqual({
        message: 'Client not in workspace',
      });
      done();
    });

    it('Should validate design request body', async done => {
      const designBody = {
        ...testDesign,
      };
      // remove client property
      delete designBody.client;
      const response = await request
        .post(`/api/v1/workspace/${testWorkspace._id}/design`)
        .send(designBody)
        .set('Authorization', authUser.token);
      expect.assertions(2);
      expect(response.status).toBe(400);
      expect(response.body.error).toEqual({
        message: ['Client is required'],
      });
      done();
    });

    it('Should add new design for a client with measurements', async done => {
      const response = await request
        .post(`/api/v1/workspace/${testWorkspace._id}/design`)
        .send({
          ...testDesign,
          client: testClient._id,
        })
        .set('Authorization', authUser.token);
      const client = await Client.findOne({
        _id: testClient._id,
        designs: { $in: [response.body.design._id] },
      }).lean();
      expect.assertions(5);
      expect(response.status).toBe(201);
      expect(response.body.design.images).toHaveLength(3);
      expect(response.body.design.client).toEqual(String(testClient._id));
      expect(response.body.design.workspace).toEqual(String(testWorkspace._id));
      expect(client.name).toEqual(testClient.name);
      done();
    });
  });
});
