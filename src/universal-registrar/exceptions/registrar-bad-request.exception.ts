import { HttpStatus } from '@nestjs/common';
import { ErrorType, RegistrarException } from './registrar.exception';

export class RegistrarBadRequestException extends RegistrarException {
  constructor(did?: string) {
    super(ErrorType.BadRequest, did, HttpStatus.BAD_REQUEST);
  }
}
