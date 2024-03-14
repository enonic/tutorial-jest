import type { Config } from '@jest/types';


import {
    AND_BELOW,
    DIR_SRC,
    DIR_DST_ASSETS,
    TEST_EXT
} from './tsup/constants';


const SOURCE_FILES = `*.{ts,tsx}`;
const TEST_FILES = `*.${TEST_EXT}`;
const TEST_MATCH_ASSETS = `<rootDir>/${DIR_DST_ASSETS}/${AND_BELOW}/${TEST_FILES}`;


const commonConfig: Config.InitialProjectOptions = {
    collectCoverageFrom: [
        `${DIR_SRC}/${AND_BELOW}/${SOURCE_FILES}`,
    ],
    injectGlobals: false,
};

const clientSideConfig: Config.InitialProjectOptions = {
    ...commonConfig,
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
        globals: {
            app: {
                name: 'com.example.tutorial.jest',
                config: {
                    default: true,
                },
                version: '1.0.0'
            },
        },
        globalSetup: '<rootDir>/test/server/globalSetup.ts',
        testEnvironment: 'node', // Run serverside tests without DOM globals such as document and window
        testMatch: [
            `<rootDir>/${DIR_SRC}/${AND_BELOW}/${TEST_FILES}`, // Every test file in src/main/resources
            `!${TEST_MATCH_ASSETS}`, // Except the ones under assets
            `<rootDir>/test/server/${AND_BELOW}/${TEST_FILES}`
        ],
        transform: {
            "^.+\\.(ts|js)x?$": [
                'ts-jest',
                {
                    tsconfig: 'test/server/tsconfig.json'
                }
            ]
        }
};

const customJestConfig: Config.InitialOptions = {
    coverageProvider: 'v8', // To get correct line numbers under jsdom
    projects: [clientSideConfig, serverSideConfig],
    // silent: false
};

export default customJestConfig;