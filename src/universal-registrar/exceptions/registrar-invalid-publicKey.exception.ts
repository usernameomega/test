import { HttpStatus } from '@nestjs/common';
import { ErrorType, RegistrarException } from './registrar.exception';

export class RegistrarInvalidPublicKeyException extends RegistrarException {
  constructor(did?: string) {
    super(ErrorType.InvalidPublicKey, did, HttpStatus.BAD_REQUEST);
  }
}
