import { Request } from 'express';

export function getContentType(request: Request): string {
  const defaultAcceptHeader =
    'application/ld+json;profile="https://w3id.org/did-resolution"';

  const allowedHeaders = [
    'application/did+json',
    'application/did+ld+json',
    'application/did+cbor',
    defaultAcceptHeader,
  ];

  const headerValue = request.headers['accept'] ?? defaultAcceptHeader;

  if (!allowedHeaders.includes(headerValue)) {
    // Override other headers with the default one, to allow browser requests
    return defaultAcceptHeader;
  }
  return headerValue;
}
