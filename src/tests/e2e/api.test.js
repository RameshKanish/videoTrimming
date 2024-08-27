const path = require('path');
const request = require('supertest');
const app = require('../../../app'); 

describe('Video API End-to-End Tests', () => {
  let server;

  beforeAll((done) => {
    server = app.listen(3000, () => {
      console.log('Test server running on port 3000');
      server.setTimeout(6000000); 
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  it('should upload a video file successfully', async () => {
    const filePath = path.resolve(__dirname, '../fixtures/sample.mp4'); 

    const response = await request(server)
      .post('/upload') 
      .attach('file', filePath);

    expect(response.statusCode).toBe(200); 
    expect(response.body).toHaveProperty('message', 'Video uploaded successfully');
  });

  it('should return an error for unsupported file types', async () => {
    const filePath = path.resolve(__dirname, '../fixtures/sample.mp4'); 

    const response = await request(server)
      .post('/upload') 
      .attach('file', filePath);

    expect(response.statusCode).toBe(400); 
    expect(response.body).toHaveProperty('error', 'Unsupported file type');
  });
});