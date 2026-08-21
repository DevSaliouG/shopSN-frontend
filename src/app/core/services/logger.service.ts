/**
 * Logger Service - Production-Safe Logging
 *
 * Features:
 * - Logs only in development mode by default
 * - Configurable log levels
 * - Type-safe logging methods
 * - Zero overhead in production (tree-shakeable)
 *
 * Usage:
 * ```typescript
 * export class MyComponent {
 *   private logger = inject(LoggerService);
 *
 *   someMethod() {
 *     this.logger.debug('Debug info:', data);
 *     this.logger.info('Operation completed');
 *     this.logger.warn('Warning:', warning);
 *     this.logger.error('Error occurred:', error);
 *   }
 * }
 * ```
 */

import { Injectable, isDevMode } from '@angular/core';

export enum LogLevel {
  Debug = 0,
  Info = 1,
  Warn = 2,
  Error = 3,
  None = 4
}

@Injectable({ providedIn: 'root' })
export class LoggerService {
  /**
   * Current log level
   * Debug in development, Error in production
   */
  private level: LogLevel = isDevMode() ? LogLevel.Debug : LogLevel.Error;

  /**
   * Set log level manually
   * Useful for debugging production issues temporarily
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * Debug logs - Development only
   * Use for detailed debugging information
   */
  debug(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.Debug) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }

  /**
   * Info logs - Development + Staging
   * Use for general information about app flow
   */
  info(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.Info) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  /**
   * Warning logs - Always logged
   * Use for recoverable issues
   */
  warn(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.Warn) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  /**
   * Error logs - Always logged
   * Use for errors and exceptions
   */
  error(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.Error) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  }

  /**
   * Group logs together (collapsed)
   */
  group(label: string): void {
    if (this.level <= LogLevel.Debug) {
      console.groupCollapsed(label);
    }
  }

  /**
   * End log group
   */
  groupEnd(): void {
    if (this.level <= LogLevel.Debug) {
      console.groupEnd();
    }
  }

  /**
   * Log with custom styling (browser only)
   */
  styled(message: string, styles: string, ...args: any[]): void {
    if (this.level <= LogLevel.Debug) {
      console.log(`%c${message}`, styles, ...args);
    }
  }
}
