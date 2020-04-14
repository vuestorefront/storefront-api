import CacheFactory from '../image/cache/factory';
import ActionFactory from '../image/action/factory';

const asyncMiddleware = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Image resizer
 *
 * ```bash
 *  curl https://your-domain.example.com/img/310/300/resize/w/p/wp07-black_main.jpg
 * ```
 *
 * or
 *
 * ```bash
 *  curl http://localhost:8080/sample-api/img/600/744/resize/m/p/mp10-black_main.jpg
 * ```
 *
 * Details: https://sfa-docs.now.sh/guide/default-modules/api.html#img
 */
export default ({ config, db }) =>
  asyncMiddleware(async (req, res, next) => {
    if (!(req.method === 'GET')) {
      res.set('Allow', 'GET');
      return res.status(405).send('Method Not Allowed');
    }
    const cacheFactory = new CacheFactory(config, req)

    req.socket.setMaxListeners(config.imageable.maxListeners || 50);

    let imageBuffer

    const actionFactory = new ActionFactory(req, res, next, config)
    const imageAction = actionFactory.getAdapter(config.imageable.action.type)
    imageAction.getOption()
    imageAction.validateOptions()
    imageAction.isImageSourceHostAllowed()
    imageAction.validateMIMEType()

    const cache = cacheFactory.getAdapter(config.imageable.caching.type)

    if (config.imageable.caching.active && await cache.check()) {
      await cache.getImageFromCache()
      imageBuffer = cache.image
    } else {
      await imageAction.processImage()

      if (config.imageable.caching.active) {
        cache.image = imageAction.imageBuffer
        await cache.save()
      }

      imageBuffer = imageAction.imageBuffer
    }

    return res
      .type(imageAction.mimeType)
      .set({ 'Cache-Control': `max-age=${imageAction.maxAgeForResponse}` })
      .send(imageBuffer);
  });
