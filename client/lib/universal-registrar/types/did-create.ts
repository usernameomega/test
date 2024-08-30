import { LdDIDDocument } from '../../universal-resolver';

export interface CreateOptions {
  method: 'hedera';
  network: 'testnet' | 'mainnet';
}

export interface DIDCreationResponse {
  jobId: null;
  didState: {
    state: 'finished';
    did: string;
    secret: {
      verificationMethod: [
        {
          id: string;
          type: 'Ed25519VerificationKey2020';
          controller: string;
          privateKeyMultibase: string;
        },
      ];
    };
    didDocument: LdDIDDocument;
  };
  didDocumentMetadata: Record<string, unknown>;
  didRegistrationMetadata: Record<string, unknown>;
}

export interface DIDCreationResult {
  didDocument: LdDIDDocument;
  privateKeyMultibase: string;
}
