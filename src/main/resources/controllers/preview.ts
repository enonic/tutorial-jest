import type {Request, Response} from '/index.d';


import { getContent, imageUrl, assetUrl } from '/lib/xp/portal';
// @ts-expect-error no-types
import { render } from '/lib/thymeleaf';


const VIEW = resolve('preview.html');


export function get(_request: Request): Response {
  const content = getContent();
  const photoId = (Array.isArray(content.data.photos)) ? content.data.photos[0] : content.data.photos;
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

  return {
    body: render(VIEW, model),
  }
};
