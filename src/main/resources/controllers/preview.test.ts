import type {ByteSource} from '@enonic-types/core';
import type {
    assetUrl,
    getContent,
    imageUrl,
} from '@enonic-types/lib-portal';
import type {App, Log, Resolve} from '../../../../test/server/global';


import {
    describe,
    expect,
    jest,
    test as it
} from '@jest/globals';
import {JavaBridge} from '@enonic/mock-xp';
import {
    get as getContext,
    run as runInContext
} from '@enonic/mock-xp/src/context';
import {readFileSync } from 'fs';
import {
    join,
    resolve as pathResolve
} from 'path';

const PROJECT = 'intro';
const PROJECT_REPO = `com.enonic.cms.${PROJECT}`;


// Avoid type errors below.
declare module globalThis {
    var app: App
    var log: Log
    var resolve: Resolve
}

const xp = new JavaBridge({
    app // This is defined in jest.config.ts
});
globalThis.log = xp.log as Log;

xp.repo.create({
    id: PROJECT_REPO
});

xp.repo.createBranch({
    branchId: 'draft',
    repoId: PROJECT_REPO
});

const contentConnection = xp.contentConnect({
    branch: 'draft',
    project: PROJECT,
});

const personFolder = contentConnection.create({
    contentType: 'base:folder',
    data: {},
    name: 'persons',
    parentPath: '/',
});

const leaSeydouxJpg = contentConnection.createMedia({
    data: readFileSync(join(__dirname, '../../../../test', 'Lea-Seydoux.jpg')) as unknown as ByteSource,
    name: 'Lea-Seydoux.jpg',
    parentPath: personFolder._path,
    mimeType: 'image/jpeg',
    focalX: 0.5,
    focalY: 0.5,
});

const leaSeydoux = contentConnection.create({
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
// console.debug(leaSeydoux);

const jeffreyWrightHpJpg = contentConnection.createMedia({
    data: readFileSync(join(__dirname, '../../../../test', 'Jeffrey-Wright-hp.jpg')) as unknown as ByteSource,
    name: 'Jeffrey-Wright-hp.jpg',
    parentPath: personFolder._path,
    mimeType: 'image/jpeg',
    focalX: 0.5,
    focalY: 0.5,
});

const jeffreyWright = contentConnection.create({
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


jest.mock('/lib/xp/portal', () => ({
    assetUrl: jest.fn<typeof assetUrl>().mockImplementation((params) => {
        // console.debug('assetUrl called with params:', params);
        const fingerprint = '0123456789abcdef';
        return `/admin/site/preview/intro/draft/_/asset/com.example.tutorial.jest:${fingerprint}/${params.path}`;
    }),
    // @ts-ignore
    getContent: jest.fn<typeof getContent>().mockImplementation(() => {
        const context = getContext();
        // console.debug(context);
        if (!context) {
            throw new Error('No context');
        }
        const contentConnection = xp.contentConnect({
            branch: context.branch,
            project: context.repository.replace('com.enonic.cms.', ''),
        });
        if (!context.currentContentkey) {
            throw new Error('No currentContentkey');
        }
        const content = contentConnection.get({key: context.currentContentkey})
        // console.debug(content);
        return content;
    }),
    imageUrl: jest.fn<typeof imageUrl>().mockImplementation((params) => {
        // console.debug('imageUrl called with params:', params);
        const {
            id,
            scale
        } = params;

        const context = getContext();
        if (!context) {
            throw new Error('No context');
        }
        const contentConnection = xp.contentConnect({
            branch: context.branch,
            project: context.repository.replace('com.enonic.cms.', ''),
        });
        const imageContent = contentConnection.get({key: id});
        // console.debug(imageContent);
        if (!imageContent) {
            throw new Error(`No imageContent with id:${id}`);
        }

        const s = scale.replace(/\((\d+)\)/,'-$1') // width(500)
        const hash = '0123456789abcdef';
        const imageUrl = `/admin/site/preview/intro/draft/persons/lea-seydoux/_/image/${id}:${hash}/${s}/${imageContent._name}`;
        // console.debug('imageUrl:', imageUrl);
        return imageUrl;
    })
}), { virtual: true });


jest.mock('/lib/thymeleaf', () => ({
    // @ts-ignore
    render: jest.fn().mockImplementation((view: string, model: Record<string, unknown>, options: Record<string, unknown>) => {
        // console.debug('render called with view:', view, 'model:', model, 'options:', options);
        return model; // Not testing the actual rendering, just that the model is correct.
    })
}), { virtual: true });


globalThis.resolve = (path: string): ReturnType<Resolve> => {
    // console.debug('resolve called with path:', path);
    if (path === 'preview.html') {
        const resolvedPath = pathResolve(__dirname, path);
        // console.debug('Resolved path:', resolvedPath);
        return resolvedPath as unknown as ReturnType<Resolve>;
    }
    throw new Error(`Unable to resolve path:${path}`);
}


describe('preview', () => {
    it('is able to build a model object for Léa Seydoux', () => {
        import('./preview').then(({get}) => {
            runInContext({
                branch: 'draft',
                currentContentkey: leaSeydoux._id,
                repository: PROJECT_REPO,
            }, () => {
                const response = get();
                expect(response).toEqual({
                    body: {
                        cssUrl: '/admin/site/preview/intro/draft/_/asset/com.example.tutorial.jest:0123456789abcdef/styles.css',
                        displayName: 'Léa Seydoux',
                        imageUrl: '/admin/site/preview/intro/draft/persons/lea-seydoux/_/image/00000000-0000-4000-8000-000000000006:0123456789abcdef/width-500/Lea-Seydoux.jpg'
                    }
                });
            });
        });
    }); // Léa Seydoux

    it('is able to build a model object for Jeffrey Wright', () => {
        import('./preview').then(({get}) => {
            runInContext({
                branch: 'draft',
                currentContentkey: jeffreyWright._id,
                repository: PROJECT_REPO,
            }, () => {
                const response = get();
                expect(response).toEqual({
                    body: {
                        cssUrl: '/admin/site/preview/intro/draft/_/asset/com.example.tutorial.jest:0123456789abcdef/styles.css',
                        displayName: 'Jeffrey Wright',
                        imageUrl: '/admin/site/preview/intro/draft/persons/lea-seydoux/_/image/00000000-0000-4000-8000-000000000010:0123456789abcdef/width-500/Jeffrey-Wright-hp.jpg'
                    }
                });
            });
        });
    }); // Jeffrey Wright
}); // describe preview