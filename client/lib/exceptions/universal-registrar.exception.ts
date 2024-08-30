type ErrorType =
  | 'invalidDid'
  | 'badRequest'
  | 'internalError'
  | 'invalidPublicKey'
  | 'methodNotSupported'
  | 'invalidSignature';

export interface UniversalRegistrarErrorResponse {
  jobId: null;
  didState: {
    state: 'failed';
    did: string;
    reason: ErrorType;
  };
  didDocumentMetadata: Record<string, unknown>;
  didRegistrationMetadata: Record<string, unknown>;
}

export class UniversalRegistrarError extends Error {
  constructor(public readonly error: ErrorType) {
    super(error);
  }

  static fromResponse(
    response: UniversalRegistrarErrorResponse,
  ): UniversalRegistrarError {
    const { didState } = response;

    if (didState) {
      return new UniversalRegistrarError(didState.reason ?? 'internalError');
    }

    return new UniversalRegistrarError('internalError');
  }
}
