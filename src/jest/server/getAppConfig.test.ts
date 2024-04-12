import type {App, Log} from './global';

import {
    beforeAll,
    describe,
    expect,
    test as it
} from '@jest/globals';


// Avoid type errors below.
declare module globalThis {
    var app: App
    var log: Log
}


// Augment the app.config object for tests in this file.
globalThis.app.config.key = 'value';


describe('getAppConfig', () => {
    beforeAll(() => {
        // Silence log.debug for tests under this describe.
        globalThis.log.debug = () => {};
    });
    it('should return the application config', () => {
        import('/lib/tutorial-jest/getAppConfig').then(({getAppConfig}) => {
            expect(getAppConfig()).toEqual({
                default: 'true',
                key: 'value'
            });
        });
    });
});