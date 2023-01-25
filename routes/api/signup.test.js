const mongoose = require('mongoose');
const request = require('supertest');
require('dotenv').config();
mongoose.set('strictQuery', true);
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');

const app = require('../../app');
const { User } = require('../../models/user');

const { DB_TEST_HOST, PORT } = process.env;

// jest.setTimeout(10000);

describe('test signup router', () => {
  let server;
  beforeAll(() => (server = app.listen(PORT)));
  afterAll(() => server.close());

  beforeEach(done => {
    mongoose.connect(DB_TEST_HOST).then(() => done());
  });

  afterEach(done => {
    mongoose.connection.db.dropCollection(() => {
      mongoose.connection.close(() => done());
    });
  });

  test('test login', async () => {
    const userEmail = 'alex@gmail.com';
    const userPassword = '88888888';
    const avatarURL = gravatar.url(userEmail);
    const hashPassword = await bcrypt.hash(userPassword, 10);

    const newUser = {
      email: userEmail,
      password: hashPassword,
      avatarURL,
    };

    const user = await User.create(newUser);

    const loginUser = {
      email: 'alex@gmail.com',
      password: '88888888',
    };

    const response = await request(app)
      .post('/api/users/login')
      .send(loginUser);

    expect(response.statusCode).toBe(200);
    const { body } = response;
    expect(body.token).toByTruthy();
    // const { token } = await User.findById(user._id);
    // expect(body.token).toBe(token);
  });
});
