const request = require('supertest');
const app = require('./../../../app'); // Adjust the path as needed
const http = require('http');

let server;

beforeAll((done) => {
    server = http.createServer(app);
    server.listen(() => {
        console.log(`Test server running on port ${server.address().port}`);
        done();
    });
});

afterAll((done) => {
    server.close(done);
});

describe('Video API End-to-End Tests', () => {
    describe('POST /videos/upload', () => {
        it('should upload a video file successfully', async () => {
            const response = await request(server)
                .post('/videos/upload')
                .attach('file', 'src/tests/fixtures/sample.mp4');
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Video uploaded successfully');
        }, 100000); // 10 seconds
        

        it('should upload a video file successfully', async () => {
            const response = await request(server)
                .post('/videos/upload')
                .attach('file', 'src/tests/fixtures/largefile.mp4');
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Video uploaded successfully');
        }, 100000);
    });
});