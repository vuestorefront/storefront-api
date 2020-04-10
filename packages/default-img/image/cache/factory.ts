'use strict'

import { Request } from 'express'
import { IConfig } from 'config'
import { Cache, ImageCacheConstructor } from './abstract'

export default class CacheFactory {
  private request: Request
  private config: IConfig
  public static adapter: Record<string, any> = {}

  public constructor (app_config: IConfig, req: Request) {
    this.config = app_config
    this.request = req
  }

  public static addAdapter (type: string, object: Record<any, any>): any {
    CacheFactory.adapter[type] = object
  }

  public getAdapter (type: string, ...constructorParams): any {
    let AdapterClass: ImageCacheConstructor|undefined = CacheFactory.adapter[type]

    if (!AdapterClass) {
      AdapterClass = require(`./${type}`).default
    }

    if (!AdapterClass) {
      throw new Error(`Invalid adapter ${type}`)
    } else {
      const adapterInstance: Cache = new AdapterClass(this.config, this.request)
      if ((typeof adapterInstance.isValidFor === 'function') && !adapterInstance.isValidFor(type)) { throw new Error(`Not valid adapter class or adapter is not valid for ${type}`) }
      return adapterInstance
    }
  }
}

export {
  CacheFactory
}
