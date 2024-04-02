//──────────────────────────────────────────────────────────────────────────────
// Type imports
//──────────────────────────────────────────────────────────────────────────────
import type {ByteSource} from '@enonic-types/core';
import type {
    assetUrl as assetUrlType,
    getContent as getContentType,
    imageUrl as imageUrlType,
} from '@enonic-types/lib-portal';
import type {Log, Resolve} from '../../../../test/server/global';


//──────────────────────────────────────────────────────────────────────────────
// Value imports
//──────────────────────────────────────────────────────────────────────────────
import {
    describe,
    expect,
    jest,
    test as it
} from '@jest/globals';
import {
    App,
    LibContent,
    LibPortal,
    Request,
    Server
} from '@enonic/mock-xp/src';
import {readFileSync} from 'fs';
import {
    join,
    resolve as pathResolve
} from 'path';


//──────────────────────────────────────────────────────────────────────────────
// Constants
//──────────────────────────────────────────────────────────────────────────────
const APP_KEY = 'com.example.tutorial.jest';
const PROJECT_NAME = 'intro';


//──────────────────────────────────────────────────────────────────────────────
// Mock XP
//──────────────────────────────────────────────────────────────────────────────
const server = new Server({
    loglevel: 'debug'
}).createProject({
    projectName: PROJECT_NAME
}).setContext({
    projectName: PROJECT_NAME
});

const app = new App({
    key: APP_KEY
});

const libContent = new LibContent({
    server
});

const libPortal = new LibPortal({
    app,
    server
});


//──────────────────────────────────────────────────────────────────────────────
// Mock globals
//──────────────────────────────────────────────────────────────────────────────
// Avoid type errors below.
// eslint-disable-next-line @typescript-eslint/no-namespace
declare module globalThis {
    let log: Log
    let resolve: Resolve
}
globalThis.log = server.log as Log;
globalThis.resolve = (path: string): ReturnType<Resolve> => {
    // console.debug('resolve called with path:', path);
    if (path === 'preview.html') {
        const resolvedPath = pathResolve(__dirname, path);
        // console.debug('Resolved path:', resolvedPath);
        return resolvedPath as unknown as ReturnType<Resolve>;
    }
    throw new Error(`Unable to resolve path:${path}`);
}


//──────────────────────────────────────────────────────────────────────────────
// Mock modules
//──────────────────────────────────────────────────────────────────────────────
declare type Model = Record<string, unknown>;
declare type RenderFn = (
    _view: string,
    _model: Model,
    _options: Record<string, unknown>
) => Model;

jest.mock('/lib/thymeleaf', () => ({
    render: jest.fn<RenderFn>().mockImplementation((
        _view,
        model,
        // options
    ) => {
        return model; // Not testing the actual rendering, just that the model is correct.
    })
}), { virtual: true });

jest.mock('/lib/xp/portal', () => {
    return {
        assetUrl: jest.fn<typeof assetUrlType>((a) => libPortal.assetUrl(a)),
        getContent: jest.fn<typeof getContentType>(() => libPortal.getContent()),
        imageUrl: jest.fn<typeof imageUrlType>((a) => libPortal.imageUrl(a)),
    }
}, { virtual: true });


//──────────────────────────────────────────────────────────────────────────────
// Test data
//──────────────────────────────────────────────────────────────────────────────
const personFolder = libContent.create({
    contentType: 'base:folder',
    data: {},
    name: 'persons',
    parentPath: '/',
});

const leaSeydouxJpg = libContent.createMedia({
    data: readFileSync(join(__dirname, '../../../../test', 'Lea-Seydoux.jpg')) as unknown as ByteSource,
    name: 'Lea-Seydoux.jpg',
    parentPath: personFolder._path,
    mimeType: 'image/jpeg',
    focalX: 0.5,
    focalY: 0.5,
});

libContent.create({
    contentType: 'com.example.tutorial.jest:person',
    data: {
        bio: "French actress Léa Seydoux was born in 1985 in Paris, France, to Valérie Schlumberger, a philanthropist, and Henri Seydoux, a businessman.",
        dateofbirth: "1985-07-01",
        photos: leaSeydouxJpg._id,
    },
    name: 'lea-seydoux',
    displayName: 'Léa Seydoux',
    parentPath: personFolder._path,
});

const jeffreyWrightHpJpg = libContent.createMedia({
    data: readFileSync(join(__dirname, '../../../../test', 'Jeffrey-Wright-hp.jpg')) as unknown as ByteSource,
    name: 'Jeffrey-Wright-hp.jpg',
    parentPath: personFolder._path,
    mimeType: 'image/jpeg',
    focalX: 0.5,
    focalY: 0.5,
});

libContent.create({
    contentType: 'com.example.tutorial.jest:person',
    data: {
        bio: "Born and raised in Washington DC, Jeffrey Wright graduated from Amherst College in 1987. Although he studied Political Science while at Amherst, Wright left the school with a love for acting. Shortly after graduating he won an acting scholarship to NYU, but dropped out after only two months to pursue acting full-time.",
        dateofbirth: "1965-12-07",
        photos: jeffreyWrightHpJpg._id,
    },
    name: 'jeffrey-wright',
    displayName: 'Jeffrey Wright',
    parentPath: personFolder._path,
});


//──────────────────────────────────────────────────────────────────────────────
// Test suite
//──────────────────────────────────────────────────────────────────────────────
describe('preview', () => {

    it('is able to build a model object for Léa Seydoux', () => {
        libPortal.request = new Request({
            repositoryId: server.context.repository,
            path: '/admin/site/preview/intro/draft/persons/lea-seydoux'
        });
        import('./preview').then(({get}) => {
            const response = get(libPortal.request);
            expect(response).toEqual({
                body: {
                    cssUrl: '/admin/site/preview/intro/draft/persons/lea-seydoux/_/asset/com.example.tutorial.jest:0123456789abcdef/styles.css',
                    displayName: 'Léa Seydoux',
                    imageUrl: '/admin/site/preview/intro/draft/persons/lea-seydoux/_/image/00000000-0000-4000-8000-000000000006:0123456789abcdef/width-500/Lea-Seydoux.jpg'
                }
            });
        });
    }); // Léa Seydoux

    it('is able to build a model object for Jeffrey Wright', () => {
        libPortal.request = new Request({
            repositoryId: server.context.repository,
            path: '/admin/site/preview/intro/draft/persons/jeffrey-wright'
        });
        import('./preview').then(({get}) => {
            const response = get(libPortal.request);
            expect(response).toEqual({
                body: {
                    cssUrl: '/admin/site/preview/intro/draft/persons/jeffrey-wright/_/asset/com.example.tutorial.jest:0123456789abcdef/styles.css',
                    displayName: 'Jeffrey Wright',
                    imageUrl: '/admin/site/preview/intro/draft/persons/jeffrey-wright/_/image/00000000-0000-4000-8000-000000000010:0123456789abcdef/width-500/Jeffrey-Wright-hp.jpg'
                }
            });
        });
    }); // Jeffrey Wright

}); // describe preview
