import type { Config } from 'jest';

const config: Config = {
  verbose: true,
  displayName: 'client',
  moduleFileExtensions: ['ts', 'js'],
  rootDir: '.',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/**/*.spec.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  setupFiles: ['./setup-tests.ts'],
};

export default config;
