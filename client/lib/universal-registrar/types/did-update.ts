import { PublicKeyJwk } from '../../shared';
import { LdDIDDocument } from '../../universal-resolver';
import { SecretVerificationMethod } from './secret-verification-method';

export type DidDocumentOperation =
  | 'addToDidDocument'
  | 'removeFromDidDocument'
  | 'deactivate';

export interface UpdateService {
  id: string;
  type: string;
  serviceEndpoint: string;
}

export interface UpdateVerificationRelationship {
  id: string;
  verificationMethod: string;
}

export interface UpdateVerificationMethod {
  id: string;
  type: string;
  controller: string;
  publicKeyMultibase?: string;
  publicKeyJwk?: PublicKeyJwk;
}

export interface DIDDocumentUpdates {
  didDocumentOperation: DidDocumentOperation[];
  didDocument: {
    verificationMethod?: (UpdateVerificationMethod | { id: string })[];
    service?: (UpdateService | { id: string })[];
    verificationRelationship?: (
      | UpdateVerificationRelationship
      | { id: string }
    )[];
  }[];
}

export interface UpdateOptions {
  did: string;
  secret: SecretVerificationMethod;
  network: 'testnet' | 'mainnet';
  updates: DIDDocumentUpdates;
}

export interface DIDUpdateResponse {
  jobId: string;
  didState: {
    state: string;
    did: string;
    secret: Record<string, any>;
    didDocument: LdDIDDocument;
  };
  didDocumentMetadata: Record<string, any>;
  didRegistrationMetadata: Record<string, any>;
}

export interface DIDUpdateResult {
  didDocument: LdDIDDocument;
}
