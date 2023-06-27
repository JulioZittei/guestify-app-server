import { resolve } from 'path'

module.exports = {
  rootDir: resolve(__dirname),
  displayName: 'All-tests',
  testMatch: [
    '<rootDir>/test/unit/**/*.test.ts',
    '<rootDir>/test/integration/**/*.test.ts',
  ],
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  coveragePathIgnorePatterns: ['/src/@types/*', '/src/config/*'],
  coverageDirectory: '<rootDir>/coverage',
  clearMocks: true,
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
      },
    ],
  },
  moduleNameMapper: {
    '@src/(.*)': '<rootDir>/src/$1',
    '@test/(.*)': '<rootDir>/test/$1',
  },
}
