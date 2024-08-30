import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorType } from '../exceptions/registrar.exception';

@Catch()
export class RegistrarExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(RegistrarExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = this.extractStatusCode(exception);
    const did = exception.did ?? '';
    const reason = this.extractErrorType(exception);

    this.logger.error(exception.stack);

    response.status(status).json({
      jobId: null,
      didState: {
        state: 'failed',
        did,
        reason,
      },
      didDocumentMetadata: {},
      didRegistrationMetadata: {},
    });
  }

  private extractErrorType(exception: any): ErrorType {
    if (Object.values(ErrorType).includes(exception.name)) {
      return exception.name;
    }

    if (exception instanceof BadRequestException) {
      return ErrorType.BadRequest;
    }

    return ErrorType.InternalError;
  }

  private extractStatusCode(exception: any): number {
    if (exception.code) {
      return exception.code;
    }

    if (exception instanceof BadRequestException) {
      return HttpStatus.BAD_REQUEST;
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }
}
