import type {ByteSource} from '@enonic-types/core';
import type {
    assetUrl as assetUrlType,
    getContent as getContentType,
    imageUrl as imageUrlType,
} from '@enonic-types/lib-portal';
import {Request} from '@enonic/mock-xp/src/types';
import type {App, Log, Resolve} from '../../../../test/server/global';


import {
    beforeEach,
    describe,
    expect,
    jest,
    test as it
} from '@jest/globals';
import {JavaBridge} from '@enonic/mock-xp';
import {readFileSync } from 'fs';
import {
    join,
    resolve as pathResolve
} from 'path';


const PROJECT = 'intro';
const PROJECT_REPO = `com.enonic.cms.${PROJECT}`;
const branch = 'draft';
const project = 'intro';
const scheme = 'http';
const host = 'localhost';
const port = 8080;
const mode = 'preview';

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
const run = xp.context.run;

xp.repo.create({
    id: PROJECT_REPO
});

xp.repo.createBranch({
    branchId: 'draft',
    repoId: PROJECT_REPO
});

globalThis.resolve = (path: string): ReturnType<Resolve> => {
    // console.debug('resolve called with path:', path);
    if (path === 'preview.html') {
        const resolvedPath = pathResolve(__dirname, path);
        // console.debug('Resolved path:', resolvedPath);
        return resolvedPath as unknown as ReturnType<Resolve>;
    }
    throw new Error(`Unable to resolve path:${path}`);
}

function mockLibXpPortal(context) {
    jest.mock('/lib/xp/portal', () => ({
        assetUrl: jest.fn<typeof assetUrlType>().mockImplementation((a) => {
            return run(context, () => {
                return xp.portal.assetUrl(a)
            });
        }),
        getContent: jest.fn<typeof getContentType>().mockImplementation(() => {
            return run(context, () => {
                return xp.portal.getContent();
            });
        }),
        imageUrl: jest.fn<typeof imageUrlType>().mockImplementation((a) => {
            return run(context, () => {
                return xp.portal.imageUrl(a);
            });
        }),
    }), { virtual: true });
}


run({
    branch: 'draft',
    repository: PROJECT_REPO,
}, () => {
    const personFolder = xp.content.create({
        contentType: 'base:folder',
        data: {},
        name: 'persons',
        parentPath: '/',
    });

    const leaSeydouxJpg = xp.content.createMedia({
        data: readFileSync(join(__dirname, '../../../../test', 'Lea-Seydoux.jpg')) as unknown as ByteSource,
        name: 'Lea-Seydoux.jpg',
        parentPath: personFolder._path,
        mimeType: 'image/jpeg',
        focalX: 0.5,
        focalY: 0.5,
    });
    
    const leaSeydoux = xp.content.create({
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

    const jeffreyWrightHpJpg = xp.content.createMedia({
        data: readFileSync(join(__dirname, '../../../../test', 'Jeffrey-Wright-hp.jpg')) as unknown as ByteSource,
        name: 'Jeffrey-Wright-hp.jpg',
        parentPath: personFolder._path,
        mimeType: 'image/jpeg',
        focalX: 0.5,
        focalY: 0.5,
    });

    const jeffreyWright = xp.content.create({
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

    describe('preview', () => {
        beforeEach(() => {
            jest.resetModules();
            jest.mock('/lib/thymeleaf', () => ({
                // @ts-ignore
                render: jest.fn().mockImplementation((view: string, model: Record<string, unknown>, options: Record<string, unknown>) => {
                    // console.debug('render called with view:', view, 'model:', model, 'options:', options);
                    return model; // Not testing the actual rendering, just that the model is correct.
                })
            }), { virtual: true });
        });

        it('is able to build a model object for Léa Seydoux', () => {
            const path = `/admin/site/${mode}/${project}/${branch}/persons/lea-seydoux`;
            const request: Request = {
                branch,
                host,
                method: 'GET',
                mode,
                path,
                port,
                scheme,
                url: `${scheme}://${host}:${port}${path}`,
            }
            const context = {
                branch,
                currentApplicationKey: xp.app.name,
                currentContentkey: leaSeydoux._id,
                request,
                repository: PROJECT_REPO,
            };
            run(context, () => {
                mockLibXpPortal(context);
                import('./preview').then(({get}) => {
                    const response = get(request);
                    expect(response).toEqual({
                        body: {
                            cssUrl: '/admin/site/preview/intro/draft/persons/lea-seydoux/_/asset/com.example.tutorial.jest:0123456789abcdef/styles.css',
                            displayName: 'Léa Seydoux',
                            imageUrl: '/admin/site/preview/intro/draft/persons/lea-seydoux/_/image/00000000-0000-4000-8000-000000000006:0123456789abcdef/width-500/Lea-Seydoux.jpg'
                        }
                    });
                });
            });
        }); // Léa Seydoux

        it('is able to build a model object for Jeffrey Wright', () => {
            const path = `/admin/site/${mode}/${project}/${branch}/persons/jeffrey-wright`;
            const request: Request = {
                branch,
                host,
                method: 'GET',
                mode,
                path,
                port,
                scheme,
                url: `${scheme}://${host}:${port}${path}`,
            }
            const context = {
                branch,
                currentApplicationKey: xp.app.name,
                currentContentkey: jeffreyWright._id,
                request,
                repository: PROJECT_REPO,
            };
            run(context, () => {
                mockLibXpPortal(context);
                import('./preview').then(({get}) => {
                    const response = get(request);
                    expect(response).toEqual({
                        body: {
                            cssUrl: '/admin/site/preview/intro/draft/persons/jeffrey-wright/_/asset/com.example.tutorial.jest:0123456789abcdef/styles.css',
                            displayName: 'Jeffrey Wright',
                            imageUrl: '/admin/site/preview/intro/draft/persons/jeffrey-wright/_/image/00000000-0000-4000-8000-000000000010:0123456789abcdef/width-500/Jeffrey-Wright-hp.jpg'
                        }
                    });
                });
            });
        }); // Jeffrey Wright
    });
}); // run