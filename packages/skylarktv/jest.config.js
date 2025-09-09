const nextJest = require("next/jest");
const base = require("../../jest.config");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  ...base,
  setupFilesAfterEnv: ["./setupJestTests.js"],
  testPathIgnorePatterns: [
    ...(base.testPathIgnorePatterns || []),
    "<rootDir>/e2e/",
  ],
};

module.exports = createJestConfig(customJestConfig);
