import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as any;

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: ctx.getRequest().url,
      message: exceptionResponse.message || exception.message,
      ...(typeof exceptionResponse === 'object' &&
        exceptionResponse.error && { error: exceptionResponse.error }),
    };

    this.logger.error(`${status} ${ctx.getRequest().method} ${ctx.getRequest().url}:`, exception.message);

    response.status(status).json(errorResponse);
  }
}
