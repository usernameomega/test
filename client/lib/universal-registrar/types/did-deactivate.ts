import { SecretVerificationMethod } from './secret-verification-method';

export interface DeactivateOptions {
  did: string;
  secret: SecretVerificationMethod;
}
