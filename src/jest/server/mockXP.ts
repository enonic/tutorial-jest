import type {
  assetUrl as assetUrlType,
  getContent as getContentType,
  imageUrl as imageUrlType,
} from '@enonic-types/lib-portal';
import type {Log, Resolve} from './global';


import {
    App,
    LibContent,
    LibPortal,
    mockResolve,
    Server
} from '@enonic/mock-xp';
import {jest} from '@jest/globals';


export {
    Request,
} from '@enonic/mock-xp';


const APP_KEY = 'com.example.tutorial.jest';
const PROJECT_NAME = 'intro';


export const server = new Server({
    loglevel: 'debug'
}).createProject({
    projectName: PROJECT_NAME
}).setContext({
    projectName: PROJECT_NAME
});

// Avoid type errors below.
// eslint-disable-next-line @typescript-eslint/no-namespace
declare module globalThis {
  let log: Log
  let resolve: Resolve
}

globalThis.log = server.log as Log;
globalThis.resolve = mockResolve({
  applicationKey: APP_KEY,
  basePath: __dirname
});

const app = new App({
    key: APP_KEY
});

export const libContent = new LibContent({
    server
});

export const libPortal = new LibPortal({
    app,
    server
});


jest.mock('/lib/xp/portal', () => {
    return {
        assetUrl: jest.fn<typeof assetUrlType>((params) => libPortal.assetUrl(params)),
        getContent: jest.fn<typeof getContentType>(() => libPortal.getContent()),
        imageUrl: jest.fn<typeof imageUrlType>((params) => libPortal.imageUrl(params)),
    }
}, { virtual: true });
