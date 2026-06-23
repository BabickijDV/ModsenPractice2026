import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

const DEFAULT_STATUS = HttpStatus.INTERNAL_SERVER_ERROR;
const DEFAULT_ERROR = 'Internal Server Error';
const DEFAULT_MESSAGE = 'An unexpected error occurred';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = DEFAULT_STATUS;
    let error = DEFAULT_ERROR;
    let message: string | string[] = DEFAULT_MESSAGE;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
        error = exception.name;
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as any;
        message = resObj.message ?? exception.message;
        error = resObj.error ?? exception.name;
      }
    } else {
      this.logger.error('Unhandled exception', exception);
    }

    response.status(statusCode).json({
      statusCode,
      error,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
