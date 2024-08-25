// jest.setup.js
jest.mock('sqlite3', () => {
    const mockSqlite3 = {
      verbose: jest.fn(() => ({
        Database: jest.fn(),
      })),
    };
    return mockSqlite3;
  });
  // jest.setup.js or at the top of your test file
jest.mock('sqlite3', () => {
    const sqlite3Mock = {
        Database: jest.fn(() => ({
            serialize: jest.fn((callback) => callback()), // Mock serialize method
            run: jest.fn(),
            get: jest.fn(),
            all: jest.fn(),
            close: jest.fn(),
        })),
        verbose: jest.fn().mockReturnThis(),
    };

    return sqlite3Mock;
});
