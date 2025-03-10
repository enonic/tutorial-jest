import type {Content} from '/lib/xp/portal';
import {SerializableRequest as Request, Response} from '@enonic-types/core';

import {getContent, imageUrl, assetUrl} from '/lib/xp/portal';


declare type ContentWithPhotos = Content<{
  photos?: string|string[]
}>;


// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function get(_request: Request): Response {
  const content = getContent<ContentWithPhotos>();
  const {data, displayName} = content;
  const photoId = Array.isArray(data.photos) ? data.photos[0] : data.photos;
  const imageSrc = photoId
  ? imageUrl({
    id: photoId,
    scale: "width(500)",
  })
  : null;
  const img = imageSrc ? `<img src="${imageSrc}"/>` : '';
  const styleHref = assetUrl({path: 'styles.css'});
  return {
    body: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>${displayName || 'Preview of content without display name'}</title>
    <link rel="stylesheet" type="text/css" href="${styleHref}"/>
  </head>
  <body>
    <h1>${displayName || 'Display name missing'}</h1>
    ${img}
    <h3>This is a sample preview</h3>
    Use live integrations with your front-end, or just a mockup - like this  :-)
  </body>
</html>`
  };
};
