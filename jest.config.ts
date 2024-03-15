import type { Config } from '@jest/types';


import {
    AND_BELOW,
    DIR_SRC,
    DIR_SRC_ASSETS,
    TEST_EXT
} from './tsup/constants';


const SOURCE_FILES = `*.{ts,tsx}`;
const TEST_FILES = `*.${TEST_EXT}`;
const TEST_MATCH_ASSETS = `<rootDir>/${DIR_SRC_ASSETS}/${AND_BELOW}/${TEST_FILES}`;


const commonConfig: Config.InitialProjectOptions = {
    collectCoverageFrom: [
        `${DIR_SRC}/${AND_BELOW}/${SOURCE_FILES}`,
    ],
    injectGlobals: false, // Import from '@jest/globals' in each test file instead.
};

const clientSideConfig: Config.InitialProjectOptions = {
    ...commonConfig,
    displayName: {
        color: 'white',
        name: 'CLIENT',
    },
    testEnvironment: 'jsdom', // Run clientside tests with DOM globals such as document and window
    testMatch: [
        TEST_MATCH_ASSETS, // Every test file in the assets folder
        `<rootDir>/test/client/${AND_BELOW}/${TEST_FILES}`
    ],
    transform: {
        "^.+\\.(ts|js)x?$": [
            'ts-jest',
            {
                tsconfig: 'test/client/tsconfig.json'
            }
        ]
    }
};

const serverSideConfig: Config.InitialProjectOptions = {
    ...commonConfig,
    displayName: {
        color: 'blue',
        name: 'SERVER',
    },

    // A set of global variables that need to be available in all test
    // environments.
    // If you specify a global reference value (like an object or array) here,
    // and some code mutates that value in the midst of running a test, that
    // mutation will not be persisted across test runs for other test files.
    // In addition, the globals object must be json-serializable, so it can't be
    // used to specify global functions. For that, you should use setupFiles.
    globals: {
        app: {
            name: 'com.example.tutorial.jest',
            config: {
                default: 'true',
            },
            version: '1.0.0'
        },
    },

    // A list of paths to modules that run some code to configure or set up the
    // testing environment. Each setupFile will be run once per test file. Since
    // every test runs in its own environment, these scripts will be executed in
    // the testing environment before executing setupFilesAfterEnv and before
    // the test code itself.
    setupFiles: [
        '<rootDir>/test/server/setupFile.ts'
    ],

    testEnvironment: 'node', // Run serverside tests without DOM globals such as document and window
    testMatch: [
        `<rootDir>/${DIR_SRC}/${AND_BELOW}/${TEST_FILES}`, // Every test file in src/main/resources
        `<rootDir>/test/server/${AND_BELOW}/${TEST_FILES}`
    ],
    testPathIgnorePatterns: [
        "/node_modules/", // The default
        `<rootDir>/${DIR_SRC_ASSETS}/`,
    ],
    transform: {
        "^.+\\.(ts|js)x?$": [
            'ts-jest',
            {
                tsconfig: 'test/server/tsconfig.json'
            }
        ]
    },
};

const customJestConfig: Config.InitialOptions = {
    coverageProvider: 'v8', // To get correct line numbers under jsdom
    projects: [clientSideConfig, serverSideConfig],
};

export default customJestConfig;