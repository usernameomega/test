import {
  ImportSecretVerificationMethod,
  SecretVerificationMethod,
} from './types/secret-verification-method';

export function constructVerificationMethod(
  did: string,
  options: SecretVerificationMethod,
): ImportSecretVerificationMethod['verificationMethod'] {
  if ('verificationMethod' in options) {
    return options.verificationMethod;
  }

  return {
    id: `${did}${options.verificationMethodId}`,
    type: 'Ed25519VerificationKey2020',
    controller: did,
    privateKeyJwk: options.privateKeyJwk,
    privateKeyMultibase: options.privateKeyMultibase,
  };
}
