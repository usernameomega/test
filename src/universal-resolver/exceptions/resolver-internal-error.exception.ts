import { HttpStatus } from '@nestjs/common';
import { ErrorType, ResolverException } from './resolver.exception';

export class ResolverInternalErrorException extends ResolverException {
  constructor(description: string) {
    super(
      ErrorType.InternalError,
      description,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
