import { HttpStatus } from '@nestjs/common';
import { ErrorType, ResolverException } from './resolver.exception';

export class ResolverNotSupportedException extends ResolverException {
  constructor(description: string) {
    super(
      ErrorType.methodNotSupported,
      description,
      HttpStatus.NOT_IMPLEMENTED,
    );
  }
}
