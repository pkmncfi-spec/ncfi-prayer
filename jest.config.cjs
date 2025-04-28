const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['./jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // Handle module aliases - use exact paths based on your project structure
    "^~/(.*)$": "<rootDir>/src/$1",
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
  transform: {
    // Use babel-jest to transpile tests with the next/babel preset
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }]
  },
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = {
  ...customJestConfig,
  reporters: [
    "default",
    ["./node_modules/jest-html-reporter", {
      "pageTitle": "Test Report",
      "outputPath": "./test-report/index.html"
    }]
  ],
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^firebase/app$': '<rootDir>/src/__mocks__/firebase.ts',
    '^firebase/auth$': '<rootDir>/src/__mocks__/firebase.ts',
    '^firebase/firestore$': '<rootDir>/src/__mocks__/firebase.ts',
    '^~/lib/firebase$': '<rootDir>/src/__mocks__/firebase.ts',
    '^~/context/authContext$': '<rootDir>/src/__mocks__/authContext.tsx',
    '^~/components/(.*)$': '<rootDir>/src/components/$1',
    '^~/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^geist/font/sans$': '<rootDir>/src/__mocks__/geist/font/sans',
  },
};
