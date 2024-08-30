import { HcsDid } from '@hashgraph/did-sdk-js';
import { PublicKey } from '@hashgraph/sdk';
import { VerificationMethod, VerificationRelationship } from '../../types';
import { RegistrarInvalidPublicKeyException } from '../../exceptions/registrar-invalid-publicKey.exception';
import { MultibaseCodec } from '../../utils/multibase.codec';

export const supportedProperties = [
  'service',
  'verificationMethod',
  'verificationRelationship',
];

// Functions map to add or revoke functions from the SDK
export const addFunctions = (did: HcsDid) => ({
  service: did.addService.bind(did),
  verificationMethod: did.addVerificationMethod.bind(did),
  verificationRelationship: did.addVerificationRelationship.bind(did),
});

export const revokeFunctions = (did: HcsDid) => ({
  service: did.revokeService.bind(did),
  verificationMethod: did.revokeVerificationMethod.bind(did),
  verificationRelationship: did.revokeVerificationRelationship.bind(did),
});

export const updateFunctionsMapPerOperation = (did: HcsDid) => ({
  add: addFunctions(did),
  revoke: revokeFunctions(did),
});

// Functions map to transform body into the expected format
export const addTransformerFunctions = {
  verificationMethod: (data: VerificationMethod) => {
    const publicKeyProperty = Object.keys(data).find((key) =>
      key.includes('publicKey'),
    );

    return {
      ...data,
      publicKey: getPublicKeyByType(data[publicKeyProperty], publicKeyProperty),
    };
  },
  verificationRelationship: (data: VerificationRelationship) => {
    const publicKeyProperty = Object.keys(data).find((key) =>
      key.includes('publicKey'),
    );

    return {
      ...data,
      publicKey: getPublicKeyByType(data[publicKeyProperty], publicKeyProperty),
    };
  },
};

const getPublicKeyByType = (data: any, propertyName: string) => {
  if (propertyName === 'publicKeyMultibase') {
    const publicKey = data as string;
    const multibaseCodec = new MultibaseCodec();
    const publicKeyBytes = multibaseCodec.decode(publicKey);

    return PublicKey.fromBytesED25519(publicKeyBytes);
  }

  if (propertyName === 'publicKeyJwk') {
    const jwk = data as JsonWebKey;
    const publicKeyBytes = Buffer.from(jwk.x, 'base64url');

    return PublicKey.fromBytesED25519(publicKeyBytes);
  }

  throw new RegistrarInvalidPublicKeyException();
};

export const transformFunctions = {
  add: addTransformerFunctions,
};
