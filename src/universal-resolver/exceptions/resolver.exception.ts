import { HttpException } from '@nestjs/common';

export enum ErrorType {
  InvalidDid = 'invalidDid',
  methodNotSupported = 'methodNotSupported',
  BadRequest = 'badRequest',
  InternalError = 'internalError',
  NotFound = 'notFound',
}

export class ResolverException extends HttpException {
  name: ErrorType;
  description: string;
  code: number;
  constructor(name: ErrorType, description: string, code: number) {
    super({ name, description }, code);
    this.name = name;
    this.description = description;
    this.code = code;
  }
}
