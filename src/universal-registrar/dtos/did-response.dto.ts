import {
  DidDocumentMetadata,
  DidRegistrationMetadata,
  DidState,
} from '../types/did-state.types';

export class DidResponseDto {
  constructor(partial: Partial<DidResponseDto>) {
    Object.assign(this, partial);
  }

  jobId: null;
  didState: DidState;
  didDocumentMetadata: DidDocumentMetadata;
  didRegistrationMetadata: DidRegistrationMetadata;
}
