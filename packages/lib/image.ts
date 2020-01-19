import sharp from 'sharp';
import rp from 'request-promise-native';
import config from 'config';
import Logger from '@storefront-api/lib/logger'

sharp.cache(config.get('imageable.cache'));
sharp.concurrency(config.get('imageable.concurrency'));
// @ts-ignore
sharp.counters(config.get('imageable.counters'));
sharp.simd(config.get('imageable.simd'));

export async function downloadImage (url) {
  const response = await rp.get(url, { encoding: null });
  return response
}

export async function identify (buffer) {
  try {
    const transformer = sharp(buffer);

    return transformer.metadata();
  } catch (err) {
    Logger.info(err);
  }
}

export async function resize (buffer, width, height) {
  try {
    const transformer = sharp(buffer);

    if (width || height) {
      const options = {
        withoutEnlargement: true,
        fit: sharp.fit.inside
      }
      transformer.resize(width, height, options)
    }

    return transformer.toBuffer();
  } catch (err) {
    Logger.info(err);
  }
}

export async function fit (buffer, width, height) {
  try {
    const transformer = sharp(buffer);

    if (width || height) {
      transformer.resize(width, height, { fit: 'cover' });
    }

    return transformer.toBuffer();
  } catch (err) {
    Logger.info(err);
  }
}

export async function crop (buffer, width, height, x, y) {
  try {
    const transformer = sharp(buffer);

    if (width || height || x || y) {
      transformer.extract({ left: x, top: y, width, height });
    }

    return transformer.toBuffer();
  } catch (err) {
    Logger.info(err);
  }
}
