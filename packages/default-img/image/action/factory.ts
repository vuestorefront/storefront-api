'use strict';

import { NextFunction, Request, Response } from 'express'
import { IConfig } from 'config';
import { ImageActionConstructor } from './abstract';

export default class ActionFactory {
  public request: Request
  public next: NextFunction
  public response: Response
  public config: IConfig
  public static adapter: Record<string, any> = {}

  public constructor (req: Request, res, next, app_config) {
    this.request = req
    this.response = res
    this.next = next
    this.config = app_config;
  }

  public static addAdapter (type: string, object: Record<any, any>): any {
    ActionFactory.adapter[type] = object
  }

  public getAdapter (type: string): any {
    let AdapterClass: ImageActionConstructor|undefined = ActionFactory.adapter[type]

    if (!AdapterClass) {
      AdapterClass = require(`./${type}`).default
    }

    if (!AdapterClass) {
      throw new Error(`Invalid adapter ${type}`);
    } else {
      let adapter_instance = new AdapterClass(this.request, this.response, this.next, this.config);
      if ((typeof adapter_instance.isValidFor === 'function') && !adapter_instance.isValidFor(type)) { throw new Error(`Not valid adapter class or adapter is not valid for ${type}`); }
      return adapter_instance;
    }
  }
}

export {
  ActionFactory
};
