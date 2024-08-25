# Video File Manager

## Technologies Used

- **Node.js**: JavaScript runtime for building the server-side logic.
- **Express.js**: Web framework for Node.js, used to build the API.
- **SQLite3**: Lightweight database used to store metadata of video files.
- **Fluent-FFmpeg**: Library to handle video processing like trimming and merging.
- **Multer**: Middleware for handling multipart/form-data, used for file uploads.
- **Swagger**: Tool for generating interactive API documentation.

## Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** (v16.x or higher)
- **npm** (v7.x or higher)
- **FFmpeg** (required for video processing)
- **SQLite3**

### 1 - Installation

```bash
git clone https://github.com/RameshKanish/videoTrimming.git
cd videoTrimming


2 - Install dependencies:
    npm install

3 - Set up environment variables: in .env
Use this configuration:

PORT=3000
API_TOKEN=W1buG7rkQpagWwyPAwPwUYEQwpXDuQdybsfT3pTOaL8OmAiQxwwmF162FcsftPEc
FFMPEG_PATH=C:\\ffmpeg\\bin\\ffmpeg.exe
FFPROBE_PATH=C:\\ffmpeg\\bin\\ffprobe.exe

4 - Start the application

npm run start


5 - Installing FFmpeg
FFmpeg is a crucial dependency for processing video files in this application. Follow the steps below to install and set up FFmpeg on your system:

Windows
Download FFmpeg:

Download the FFmpeg static build from the official website: https://ffmpeg.org/download.html
Extract the Archive:

Extract the downloaded archive to a directory of your choice, such as C:\ffmpeg.
Set Environment Variables:

Open the Start Menu, search for "Environment Variables," and select "Edit the system environment variables."
Click on the "Environment Variables" button.
Under "System variables," find the Path variable and click "Edit."
Click "New" and add the path to the bin directory inside your FFmpeg folder (e.g., C:\ffmpeg\bin).
Click "OK" to save your changes.
Add the following environment variables to your .env file:

FFMPEG_PATH=C:\\ffmpeg\\bin\\ffmpeg.exe
FFPROBE_PATH=C:\\ffmpeg\\bin\\ffprobe.exe


6 - .env
Paste the below values into your .env file:

PORT=3000
API_TOKEN=W1buG7rkQpagWwyPAwPwUYEQwpXDuQdybsfT3pTOaL8OmAiQxwwmF162FcsftPEc
FFMPEG_PATH=C:\\ffmpeg\\bin\\ffmpeg.exe
FFPROBE_PATH=C:\\ffmpeg\\bin\\ffprobe.exe

API Documentation
API documentation is automatically generated using Swagger. Once the server is running, you can access the documentation at:

http://localhost:3000/api-docs

In Swagger, click the "Authorize" button and enter the API token from your .env file.

Example API Usage
1 - Upload a Video:
    curl -X POST http://localhost:3000/upload \
    -F "file=@/path/to/your/video.mp4"
2 - Trim a Video:
    curl -X POST http://localhost:3000/trim \
    -d '{"startTime": "00:00:30", "duration": "00:01:00"}' \
    -H "Content-Type: application/json"

Project Structure
app.js: Entry point of the application.
    /src: Contains the main application code.
    /controllers: Handles incoming API requests.
    /models: Contains the database models.
    /services: Contains business logic, such as video processing.
    /tests: Contains unit and end-to-end tests.
    /utils: Utility functions and helpers.
/swaggerDoc: Contains the Swagger documentation files.



Running Tests
This project uses Jest for unit and end-to-end testing.

Unit Tests
Run the unit tests:
    npm run test:unit

End-to-End Tests
Run the end-to-end tests
    npm run test:e2e
Test Coverage
To generate a test coverage report:
    npm run test -- --coverage