import type {ByteSource} from '@enonic-types/core';


import {
    describe,
    expect,
    test as it
} from '@jest/globals';
import {
    Request,
    libContent,
    libPortal,
    server,
} from './mockXP';
import {readFileSync} from 'fs';
import {join} from 'path';


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
    data: readFileSync(join(__dirname, '..', 'Lea-Seydoux.jpg')) as unknown as ByteSource,
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
    data: readFileSync(join(__dirname, '..', 'Jeffrey-Wright-hp.jpg')) as unknown as ByteSource,
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

    it('is able to render a page for Léa Seydoux', () => {
        libPortal.request = new Request({
            repositoryId: server.context.repository,
            path: '/admin/site/preview/intro/draft/persons/lea-seydoux'
        });
        import('/controllers/preview').then(({get}) => {
            const response = get(libPortal.request);
            expect(response).toEqual({
                body: `<!DOCTYPE html>
<html>
  <head>
    <meta charset=\"utf-8\">
    <title>Léa Seydoux</title>
    <link rel=\"stylesheet\" type=\"text/css\" href=\"/admin/site/preview/intro/draft/persons/lea-seydoux/_/asset/com.example.tutorial.jest:0123456789abcdef/styles.css\"/>
  </head>
  <body>
    <h1>Léa Seydoux</h1>
    <img src=\"/admin/site/preview/intro/draft/persons/lea-seydoux/_/image/00000000-0000-4000-8000-000000000006:0123456789abcdef/width-500/Lea-Seydoux.jpg\"/>
    <h3>This is a sample preview</h3>
    Use live integrations with your front-end, or just a mockup - like this  :-)
  </body>
</html>`
            });
        });
    }); // Léa Seydoux

    it('is able to render a page for Jeffrey Wright', () => {
        libPortal.request = new Request({
            repositoryId: server.context.repository,
            path: '/admin/site/preview/intro/draft/persons/jeffrey-wright'
        });
        import('/controllers/preview').then(({get}) => {
            const response = get(libPortal.request);
            expect(response).toEqual({
                body: `<!DOCTYPE html>
<html>
  <head>
    <meta charset=\"utf-8\">
    <title>Jeffrey Wright</title>
    <link rel=\"stylesheet\" type=\"text/css\" href=\"/admin/site/preview/intro/draft/persons/jeffrey-wright/_/asset/com.example.tutorial.jest:0123456789abcdef/styles.css\"/>
  </head>
  <body>
    <h1>Jeffrey Wright</h1>
    <img src=\"/admin/site/preview/intro/draft/persons/jeffrey-wright/_/image/00000000-0000-4000-8000-000000000010:0123456789abcdef/width-500/Jeffrey-Wright-hp.jpg\"/>
    <h3>This is a sample preview</h3>
    Use live integrations with your front-end, or just a mockup - like this  :-)
  </body>
</html>`
            });
        });
    }); // Jeffrey Wright

}); // describe preview
