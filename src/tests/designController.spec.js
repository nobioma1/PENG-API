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
  designType: 'UNISEX',
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
    Sleeve: 31,
    Cuff: 42,
    Neck: 5,
    topLength: 40,
    seatWaist: 10,
    thighs: 11,
    trouserLength: 43,
    bar: 12,
    chest: 13,
    burst: 12,
    dressLength: 10,
    shoulderToUnderBust: 8,
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
  await Workspace.findByIdAndUpdate(testWorkspace._id, {
    $push: {
      clients: testClient._id,
    },
  });
  testDesign.client = testClient._id;
  done();
});

describe('Design Controller', () => {
  describe('Add Design [POST] /api/v1/workspace/:workspaceID/client/:clientID/design', () => {
    it('Should check if client is in workspace', async done => {
      const response = await request
        .post(
          `/api/v1/workspace/${testWorkspace._id}/client/${testClient._id}/design`,
        )
        .send(testDesign)
        .set('Authorization', authUser.token);
      expect.assertions(2);
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: 'Client not in workspace',
      });
      done();
    });
  });
});
