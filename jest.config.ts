import type { Config } from '@jest/types';
import nextJest from 'next/jest';
// import nextJest from 'next/jest'

const createJestConfig = nextJest({
  dir: './',
});

const config: Config.InitialOptions = {
  verbose: true,
  preset: 'ts-jest',
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy', // Mock CSS imports
    '^@/(.*)$': '<rootDir>/$1',
  },
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[tj]s?(x)'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(jose)/)', // Transform ESM dependencies like `jose`
  ],
  modulePathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/node_modules/'],
  transform: {
    '^.+\\.(ts|tsx)?$': 'babel-jest',
  },
};

export default createJestConfig(config);
