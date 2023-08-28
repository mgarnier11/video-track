/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from "jest";

const config: Config = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  coverageThreshold: {
    global: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
  maxWorkers: "75%",
  moduleNameMapper: {
    "^(\\.\\.?\\/.+)\\.js$": "$1",
  },
  preset: "ts-jest",
  resetMocks: true,
  resetModules: true,
  restoreMocks: true,
  roots: ["src/lib"],
  testEnvironment: "node",
  transform: {
    // "^.+\\.ts?$": "ts-jest",
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        diagnostics: {
          ignoreCodes: [1343],
        },
        astTransformers: {
          before: [
            {
              path: "node_modules/ts-jest-mock-import-meta", // or, alternatively, 'ts-jest-mock-import-meta' directly, without node_modules.
              options: { metaObjectReplacement: { url: "https://www.url.com" } },
            },
          ],
        },
      },
    ],
  },
  transformIgnorePatterns: ["<rootDir>/node_modules/"],
};

export default config;
