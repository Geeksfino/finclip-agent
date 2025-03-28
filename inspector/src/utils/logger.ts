/**
 * Simple logger utility for CxAgent Inspector
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

export class Logger {
  private static instance: Logger;
  private level: LogLevel = LogLevel.INFO;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setLevel(level: LogLevel | string): void {
    if (typeof level === 'string') {
      switch (level.toLowerCase()) {
        case 'debug': this.level = LogLevel.DEBUG; break;
        case 'info': this.level = LogLevel.INFO; break;
        case 'warn': this.level = LogLevel.WARN; break;
        case 'error': this.level = LogLevel.ERROR; break;
        case 'none': this.level = LogLevel.NONE; break;
        default: this.level = LogLevel.INFO;
      }
    } else {
      this.level = level;
    }
  }

  getLevel(): LogLevel {
    return this.level;
  }

  debug(message: string): void {
    if (this.level <= LogLevel.DEBUG) {
      console.log(`DEBUG: ${message}`);
    }
  }

  info(message: string): void {
    if (this.level <= LogLevel.INFO) {
      console.log(message);
    }
  }

  warn(message: string): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(message);
    }
  }

  error(message: string): void {
    if (this.level <= LogLevel.ERROR) {
      console.error(message);
    }
  }
}

export const logger = Logger.getInstance();
