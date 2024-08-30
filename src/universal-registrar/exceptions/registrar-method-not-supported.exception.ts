import { HttpStatus } from '@nestjs/common';
import { ErrorType, RegistrarException } from './registrar.exception';

export class RegistrarMethodNotSupportedException extends RegistrarException {
  constructor(did?: string) {
    super(ErrorType.MethodNotSupported, did, HttpStatus.BAD_REQUEST);
  }
}
