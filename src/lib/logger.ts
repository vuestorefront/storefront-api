import { isObject } from 'lodash';
import clc from 'cli-color';
import { inspect } from 'util';

const yellow = clc.yellow

export interface BaseLogger {
  info(message: any, context?: string|Record<any, any>),
  error(message: any, trace?: string, context?: string|Record<any, any>),
  warn(message: any, context?: string|Record<any, any>),
  debug?(message: any, context?: string|Record<any, any>),
  verbose?(message: any, context?: string|Record<any, any>)
}
export type LogLevel = 'info' | 'error' | 'warn' | 'debug' | 'verbose';

export class Logger implements BaseLogger {
  private static logLevels: LogLevel[] = [
    'info',
    'error',
    'warn',
    'debug',
    'verbose'
  ];

  private static lastTimestamp?: number;
  private static instance?: typeof Logger | BaseLogger = Logger;
  protected context?: string
  private readonly isTimestampEnabled

  public constructor (isTimestampEnabled: boolean = false, context?: string) {
    this.isTimestampEnabled = isTimestampEnabled
    this.context = context
  }

  public error (message: any, trace = '', context?: string) {
    const instance = this.getInstance();
    if (!this.isLogLevelEnabled('error')) {
      return;
    }
    const test = context || this.context
    instance &&
    instance.error(message, trace, test);
  }

  public info (message: any, context?: string|Record<any, any>) {
    this.callFunction('info', message, context);
  }

  public warn (message: any, context?: string|Record<any, any>) {
    this.callFunction('warn', message, context);
  }

  public debug (message: any, context?: string|Record<any, any>) {
    this.callFunction('debug', message, context);
  }

  public verbose (message: any, context?: string|Record<any, any>) {
    this.callFunction('verbose', message, context);
  }

  public setContext (context: string) {
    this.context = context;
  }

  public static overrideLogger (logger: BaseLogger | LogLevel[] | boolean) {
    if (Array.isArray(logger)) {
      this.logLevels = logger;
      return;
    }
    this.instance = isObject(logger) ? (logger as BaseLogger) : undefined;
  }

  public static info (message: any, context: string|Record<any, any> = '', isTimeDiffEnabled = true) {
    this.printMessage(message, clc.green, context, isTimeDiffEnabled);
  }

  public static error (
    message: any,
    trace = '',
    context: string|Record<any, any> = '',
    isTimeDiffEnabled = true
  ) {
    this.printMessage(message, clc.red, context, isTimeDiffEnabled);
    this.printStackTrace(trace);
  }

  public static warn (message: any, context: string|Record<any, any> = '', isTimeDiffEnabled = true) {
    this.printMessage(message, clc.yellow, context, isTimeDiffEnabled);
  }

  public static debug (message: any, context: string|Record<any, any> = '', isTimeDiffEnabled = true) {
    this.printMessage(message, clc.magentaBright, context, isTimeDiffEnabled);
  }

  public static verbose (message: any, context: string|Record<any, any> = '', isTimeDiffEnabled = true) {
    this.printMessage(message, clc.cyanBright, context, isTimeDiffEnabled);
  }

  private callFunction (
    name: 'info' | 'warn' | 'debug' | 'verbose',
    message: any,
    context?: string|Record<any, any>
  ) {
    if (!this.isLogLevelEnabled(name)) {
      return;
    }
    const instance = this.getInstance();
    const func = instance && (instance as typeof Logger)[name];
    func &&
    func.call(
      instance,
      message,
      context || this.context,
      this.isTimestampEnabled
    );
  }

  private getInstance (): typeof Logger | BaseLogger {
    const { instance } = Logger;
    return instance === this ? Logger : instance;
  }

  private isLogLevelEnabled (level: LogLevel): boolean {
    return Logger.logLevels.includes(level);
  }

  private static printMessage (
    message: any,
    color: (message: string) => string,
    context: string|Record<any, any> = '',
    isTimeDiffEnabled?: boolean
  ) {
    const output = isObject(message)
      ? `${color('Object:')}\n${JSON.stringify(message, null, 2)}\n`
      : color(message);

    const localeStringOptions = {
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      day: '2-digit',
      month: '2-digit'
    };
    const timestamp = new Date(Date.now()).toLocaleString(
      undefined,
      localeStringOptions
    );

    const pidMessage = color(`[Storefront-API] ${process.pid}   - `);
    const contextMessage = context === '' ? '' : isObject(context)
      ? `\n${yellow('Object:')} ${inspect(context, { colors: true })}\n`
      : yellow(context);
    const timestampDiff = this.updateAndGetTimestampDiff(isTimeDiffEnabled);

    process.stdout.write(
      `${pidMessage}${timestamp}  ${output}${timestampDiff} ${contextMessage}\n`
    );
  }

  private static updateAndGetTimestampDiff (
    isTimeDiffEnabled?: boolean
  ): string {
    const includeTimestamp = Logger.lastTimestamp && isTimeDiffEnabled;
    const result = includeTimestamp
      ? yellow(` +${Date.now() - Logger.lastTimestamp}ms`)
      : '';
    Logger.lastTimestamp = Date.now();
    return result;
  }

  private static printStackTrace (trace: string) {
    if (!trace) {
      return;
    }
    process.stdout.write(`${trace}\n`);
  }
}

export default Logger;
