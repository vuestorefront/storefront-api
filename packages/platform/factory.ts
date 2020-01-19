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
  private static platformName: string = ''

  public constructor (app_config: IConfig, req: Request|null = null) {
    this.config = app_config;
    this.request = req
  }

  public static addPlatform ({ name, platformImplementation }: Platform) {
    PlatformFactory.platform = platformImplementation
    PlatformFactory.platformName = name
  }

  public getAdapter (platform: string, type: string, ...constructorParams): any {
    let AdapterClass = PlatformFactory.platform[type];
    if (!AdapterClass) {
      throw new Error(`Invalid adapter ${PlatformFactory.platformName} / ${type}`);
    } else {
      let adapter_instance = new AdapterClass(this.config, this.request, ...constructorParams);
      if ((typeof adapter_instance.isValidFor === 'function') && !adapter_instance.isValidFor(type)) { throw new Error(`Not valid adapter class or adapter is not valid for ${type}`); }
      return adapter_instance;
    }
  }
}

export default PlatformFactory
