type ErrorType =
  | 'invalidDid'
  | 'methodNotSupported'
  | 'badRequest'
  | 'internalError'
  | 'notFound';

export interface UniversalResolverErrorResponse {
  didResolutionMetadata: {
    error: ErrorType;
    errorMessage: string;
    contentType: string;
  };
  didDocumentMetadata: Record<string, unknown>;
  didDocument: null;
}

export class UniversalResolverError extends Error {
  constructor(
    public readonly error: ErrorType,
    public readonly errorMessage: string,
  ) {
    super(errorMessage);
  }

  static fromResponse(
    response: UniversalResolverErrorResponse,
  ): UniversalResolverError {
    const { didResolutionMetadata } = response;

    if (didResolutionMetadata) {
      return new UniversalResolverError(
        didResolutionMetadata.error,
        didResolutionMetadata.errorMessage,
      );
    }

    return new UniversalResolverError('internalError', 'Unknown error');
  }
}
