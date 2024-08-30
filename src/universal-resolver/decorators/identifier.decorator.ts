import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { parse } from 'did-resolver';
import { ResolverBadRequestException } from '../exceptions/resolver-bad-request.exception';

export const Identifier = createParamDecorator(
  (_: unknown, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest<Request>();
    const requestUrl = decodeURIComponent(request.url);
    const didIndexStart = requestUrl.indexOf('did:');

    if (didIndexStart === -1) {
      throw new ResolverBadRequestException('Invalid DID format');
    }

    const identifier = requestUrl.slice(didIndexStart);

    const parsedIdentifier = parse(identifier);

    if (!parsedIdentifier) {
      throw new ResolverBadRequestException('Invalid DID format');
    }

    return identifier;
  },
);
