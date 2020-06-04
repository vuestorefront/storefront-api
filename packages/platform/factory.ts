'use strict';

import { Request } from 'express';
import { IConfig } from 'config';

export interface Platform {
  name: string,
  platformImplementation: Record<string, any>
}

class PlatformFactory {
  private readonly request: Request
  private readonly config: IConfig

  private static platform: Record<string, any> = {}
  private static platformName = ''

  public constructor (appConfig: IConfig, req: Request|null = null) {
    this.config = appConfig;
    this.request = req
  }

  public static addPlatform ({ name, platformImplementation }: Platform) {
    PlatformFactory.platform = platformImplementation
    PlatformFactory.platformName = name
  }

  public getAdapter (platform: string, type: string, ...constructorParams): any {
    const AdapterClass = PlatformFactory.platform[type];
    if (!AdapterClass) {
      throw new Error(`Invalid adapter ${PlatformFactory.platformName} / ${type}`);
    } else {
      const adapterInstance = new AdapterClass(this.config, this.request, ...constructorParams);
      if ((typeof adapterInstance.isValidFor === 'function') && !adapterInstance.isValidFor(type)) { throw new Error(`Not valid adapter class or adapter is not valid for ${type}`); }
      return adapterInstance;
    }
  }
}

export default PlatformFactory
