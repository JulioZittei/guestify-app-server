/* eslint-disable @typescript-eslint/no-unused-vars */
import { resolve } from 'path'

const root = resolve(__dirname, '../..')

const jestConfig = {
  ...require(`${root}/jest.config.ts`),
}

const {
  collectCoverage,
  collectCoverageFrom,
  coveragePathIgnorePatterns,
  coverageDirectory,
  ...rest
} = jestConfig

module.exports = {
  ...rest,
  rootDir: root,
  displayName: 'integration-tests',
  setupFilesAfterEnv: ['<rootDir>/test/integration/jest-setup.ts'],
  testMatch: ['<rootDir>/test/integration/**/*.test.ts'],
}
