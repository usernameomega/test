import { PrivateKeyJwk, PrivateKeyMultibase } from '../../shared';

export interface ImportSecretVerificationMethod {
  verificationMethod: {
    id: string;
    type: 'Ed25519VerificationKey2020';
    controller: string;
    privateKeyMultibase?: PrivateKeyMultibase;
    privateKeyJwk?: PrivateKeyJwk;
  };
}

export interface BuildSecretVerificationMethod {
  verificationMethodId: '#did-root-key' | string;
  privateKeyMultibase?: PrivateKeyMultibase;
  privateKeyJwk?: PrivateKeyJwk;
}

export type SecretVerificationMethod =
  | ImportSecretVerificationMethod
  | BuildSecretVerificationMethod;
