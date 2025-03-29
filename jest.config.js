/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

const config = {
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/components/$1',
  },
  coverageProvider: 'v8',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jsdom',
};

export default createJestConfig(config);