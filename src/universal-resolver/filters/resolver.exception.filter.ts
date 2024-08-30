import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, request } from 'express';
import { ErrorType } from '../exceptions/resolver.exception';
import { getContentType } from '../utils/request.utils';

@Catch()
export class ResolverExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ResolverExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.code ?? HttpStatus.INTERNAL_SERVER_ERROR;
    const description = exception.description;
    const name = exception.name ?? ErrorType.InternalError;
    const contentType = getContentType(request);

    this.logger.error(exception.stack);

    response.status(status).json({
      didResolutionMetadata: {
        error: name,
        errorMessage: description,
        contentType,
      },
      didDocumentMetadata: {},
      didDocument: null,
    });
  }
}
