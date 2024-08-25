Video File Manager

Technologies Used

Node.js: JavaScript runtime for building the server-side logic.
Express.js: Web framework for Node.js, used to build the API.
SQLite3: Lightweight database used to store metadata of video files.
Fluent-FFmpeg: Library to handle video processing like trimming and merging.
Multer: Middleware for handling multipart/form-data, used for file uploads.
Swagger: Tool for generating interactive API documentation.


Getting Started
Prerequisites
Make sure you have the following installed:

Node.js (v16.x or higher)
npm (v7.x or higher)
FFmpeg (required for video processing)
SQLite3

1 - Installation

git clone https://github.com/RameshKanish/videoTrimming.git
cd videoTrimming

2 - Install dependencies:

npm install

3 - Set up environment variables: in .env 
use this one 

PORT = 3000
API_TOKEN=W1buG7rkQpagWwyPAwPwUYEQwpXDuQdybsfT3pTOaL8OmAiQxwwmF162FcsftPEc
FFMPEG_PATH=C:\\ffmpeg\\bin\\ffmpeg.exe
FFPROBE_PATH=C:\\ffmpeg\\bin\\ffprobe.exe


4 - start the application 

npm run start or npm start

5 - Installing FFmpeg
FFmpeg is a crucial dependency for processing video files in this application. Follow the steps below to install and set up FFmpeg on your system:

Windows
Download FFmpeg:

Download the FFmpeg static build from the official website:
https://ffmpeg.org/download.html

Extract the Archive:

Extract the downloaded archive to a directory of your choice, such as C:\ffmpeg.

Set Environment Variables:

Open the Start Menu, search for "Environment Variables," and select "Edit the system environment variables."
Click on the "Environment Variables" button.
Under "System variables," find the Path variable and click "Edit."
Click "New" and add the path to the bin directory inside your FFmpeg folder (e.g., C:\ffmpeg\bin).
Click "OK" to save your changes.


add the bin folder ffmpeg and ffprobe
exmaple like this 
        |
        |
FFMPEG_PATH=C:\\ffmpeg\\bin\\ffmpeg.exe
FFPROBE_PATH=C:\\ffmpeg\\bin\\ffprobe.exe

use the same name FFMPEG_PATH and FFPROBE_PATH


6 - .env
paste the below two  api-token and and port
PORT = 3000
API_TOKEN=W1buG7rkQpagWwyPAwPwUYEQwpXDuQdybsfT3pTOaL8OmAiQxwwmF162FcsftPEc
FFMPEG_PATH=C:\\ffmpeg\\bin\\ffmpeg.exe -->   add below two as per your installation
FFPROBE_PATH=C:\\ffmpeg\\bin\\ffprobe.exe -- >add below two as per your installation


API Documentation
API documentation is automatically generated using Swagger. Once the server is running, you can access the documentation at:

run the swagger - http://localhost:3000/api-docs

in Swagger there will be authorize button in that button you have to put token 

1 - Upload a Video:
curl -X POST http://localhost:3000/upload \
-F "file=@/path/to/your/video.mp4"


2 - Trim a Video:
curl -X POST http://localhost:3000/trim \
-d '{"startTime": "00:00:30", "duration": "00:01:00"}' \
-H "Content-Type: application/json"

3 - Merge a video

curl -X POST http://localhost:3000/merge \
-F "files=@/path/to/your/video1.mp4" \
-F "files=@/path/to/your/video2.mp4"


Project Structure
app.js: Entry point of the application.

/src: Contains the main application code.
    /controllers: Handles incoming API requests.
    /models: Contains the database models.
    /services: Contains business logic, such as video processing.
    /tests: Contains unit and end-to-end tests.
    /utils: Utility functions and helpers.
/swaggerDoc: Contains the SQLite database files.



Running Tests
This project uses Jest for unit and end-to-end testing.

Unit Tests
Run the unit tests:
    npm run test:unit

End-to-End Tests
Run the end-to-end tests:
    npm run test:e2e

Test Coverage
To generate a test coverage report:

    npm run test -- --coverage


Common Issues
ECONNRESET Error
If you encounter an ECONNRESET error during end-to-end testing, it could be due to the server closing the connection unexpectedly. Ensure that:

The app is correctly imported in your test files.
The server route in the tests matches the actual route defined in your application.
Unsupported File Type Error
If you encounter errors related to unsupported file types, make sure that the file path is correct and that the file type is indeed unsupported based on your application’s logic.