import { HttpException } from '@nestjs/common';

export enum ErrorType {
  InvalidDid = 'invalidDid',
  BadRequest = 'badRequest',
  InternalError = 'internalError',
  InvalidPublicKey = 'invalidPublicKey',
  InvalidSignature = 'invalidSignature',
  MethodNotSupported = 'methodNotSupported',
}

export class RegistrarException extends HttpException {
  name: ErrorType;
  did: string;
  code: number;
  constructor(name: ErrorType, did: string, code: number) {
    super({ name, did }, code);
    this.name = name;
    this.did = did;
    this.code = code;
  }
}
