import { Logger } from '@nestjs/common';

export class LoggerUtil {
  private static logger = new Logger('LoggerUtil');

  static log(context: string, message: string): void {
    this.logger.log(`[${context}] ${message}`);
  }

  static error(context: string, message: string, error?: any): void {
    this.logger.error(`[${context}] ${message}`, error);
  }

  static warn(context: string, message: string): void {
    this.logger.warn(`[${context}] ${message}`);
  }

  static debug(context: string, message: string, data?: any): void {
    this.logger.debug(`[${context}] ${message}`, data);
  }
}
