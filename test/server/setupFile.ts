import type {App, Log} from '../../test/server/global';


// Avoid type errors
declare module globalThis {
    var app: App
    var log: Log
}


// In order for console to exist in the global scope when running tests in
// testEnvironment: 'node' the @types/node package must be installed and
// potentially listed under types in tsconfig.json.
globalThis.log = {
    debug: console.debug,
    info: console.info,
    error: console.error,
    warning: console.warn
}
