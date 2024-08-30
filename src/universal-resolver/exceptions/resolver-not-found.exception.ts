import { HttpStatus } from '@nestjs/common';
import { ErrorType, ResolverException } from './resolver.exception';

export class ResolverNotFoundException extends ResolverException {
  constructor(description: string) {
    super(ErrorType.NotFound, description, HttpStatus.NOT_FOUND);
  }
}
