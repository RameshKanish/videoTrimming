const path = require('path');
const request = require('supertest');
const app = require('../../../app'); // Properly import the app

describe('Video API End-to-End Tests', () => {
  let server;

  beforeAll((done) => {
    server = app.listen(3000, () => {
      console.log('Test server running on port 3000');
      server.setTimeout(6000000); // Increase timeout to 10 minutes
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  it('should upload a video file successfully', async () => {
    const filePath = path.resolve(__dirname, '../fixtures/sample.mp4'); // Path to your test video file

    const response = await request(server)
      .post('/upload') // Ensure this matches the correct route in your app
      .attach('file', filePath);

    expect(response.statusCode).toBe(200); // Adjust based on your expected success status code
    expect(response.body).toHaveProperty('message', 'Video uploaded successfully');
  });

  it('should return an error for unsupported file types', async () => {
    const filePath = path.resolve(__dirname, '../fixtures/sample.mp4'); // Correct file path for unsupported type

    const response = await request(server)
      .post('/upload') // Ensure this matches the correct route in your app
      .attach('file', filePath);

    expect(response.statusCode).toBe(400); // Adjust based on your error handling
    expect(response.body).toHaveProperty('error', 'Unsupported file type');
  });
});