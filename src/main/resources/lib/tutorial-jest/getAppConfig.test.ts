import type {App, Log} from '../../../../../test/server/global';

import {
    describe,
    expect,
    test as it
} from '@jest/globals';
import { getAppConfig } from './getAppConfig';


// Avoid type errors below.
declare module globalThis {
    var app: App
    var log: Log
}


// Augment the app.config object for tests in this file.
globalThis.app.config.key = 'value';


// Silence log.debug for tests in this file.
globalThis.log.debug = () => {};


describe('getAppConfig', () => {
    it('should return the application config', () => {
        expect(getAppConfig()).toEqual({
            default: true,
            key: 'value'
        });
    });
});