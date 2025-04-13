module.exports = {
    transform: {
      "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
    },
    testEnvironment: "jsdom",
    moduleNameMapper: {
      "^~/(.*)$": "<rootDir>/src/$1",
    },
    setupFilesAfterEnv: ["@testing-library/jest-dom"],
  };