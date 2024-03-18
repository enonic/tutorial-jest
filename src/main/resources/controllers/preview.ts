import type {Request, Response } from '/index.d';


// import {toStr} from '@enonic/js-utils/value/toStr';
import { getContent, imageUrl, assetUrl } from '/lib/xp/portal';
// @ts-expect-error no-types
import { render } from '/lib/thymeleaf';


export function get(request: Request): Response {
    // log.info('request:%s', toStr(request));

    const content = getContent();
    const photoId = (Array.isArray(content.data.photos)) ? content.data.photos[0] : content.data.photos;
    const view = resolve('preview.html');
    const model = {
      cssUrl: assetUrl({path: 'styles.css'}),
      displayName: (content.displayName) ? content.displayName : null,
      imageUrl: (photoId)
        ? imageUrl({
          id: photoId,
          scale: "width(500)",
        })
        : null
    };
    // log.info('model:%s', toStr(model));

   return {
    body: render(view, model),
   }
};
