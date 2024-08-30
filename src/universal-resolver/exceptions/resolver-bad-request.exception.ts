import { HttpStatus } from '@nestjs/common';
import { ErrorType, ResolverException } from './resolver.exception';

export class ResolverBadRequestException extends ResolverException {
  constructor(description: string) {
    super(ErrorType.BadRequest, description, HttpStatus.BAD_REQUEST);
  }
}
