import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { getContentType } from '../utils/request.utils';

export const DIDAcceptHeader = createParamDecorator(
  (_: unknown, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest<Request>();
    return getContentType(request);
  },
);
