import { Request } from 'express'
import { IConfig } from 'config';

export interface ImageCacheConstructor {
  new(config, req: Request): Cache

}

export default abstract class ImageCache implements Cache {
  public image: Buffer
  public config
  public req: Request
  public key: string

  public constructor (config, req) {
    this.config = config
    this.req = req
    this.key = this.createKey()
  }

  abstract getImageFromCache()

  abstract save()

  abstract check()

  abstract createKey(): string

  abstract isValidFor(type: string): boolean
}

interface Cache {
  image: Buffer,
  config: any,
  req: Request,
  key: string,
  getImageFromCache(): void,
  save(): void,
  check(): void,
  createKey(): string,
  isValidFor(type: string): boolean
}

export {
  // eslint-disable-next-line no-undef
  Cache,
  ImageCache
}
