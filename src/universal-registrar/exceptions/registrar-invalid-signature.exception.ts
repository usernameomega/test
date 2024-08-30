import { HttpStatus } from '@nestjs/common';
import { ErrorType, RegistrarException } from './registrar.exception';

export class RegistrarInvalidSignatureException extends RegistrarException {
  constructor(did?: string) {
    super(ErrorType.InvalidSignature, did, HttpStatus.BAD_REQUEST);
  }
}
