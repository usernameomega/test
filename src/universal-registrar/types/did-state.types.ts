export type DidState = {
  state: 'finished' | 'failed' | 'action' | 'wait';
  did: string;
  secret?: Secret;
  didDocument?: DidDocumentRepresentation;
  action?:
    | 'redirect'
    | 'getVerificationMethod'
    | 'signPayload'
    | 'decryptPayload';
  url?: string;
  wait?: string;
  waitTime?: number;
  reason?: string;
  verificationMethodTemplate?: VerificationMethodTemplate[];
  signingRequest?: SigningRequestSet;
  decryptionRequest?: DecryptionRequestSet;
};

export interface DidDocumentRepresentation {
  '@context': string | string[];
  id: string;
  alsoKnownAs?: string[];
  controller?: string | string[];
  verificationMethod?: VerificationMethod[];
  authentication?: (string | VerificationMethod)[];
  assertionMethod?: (string | VerificationMethod)[];
  keyAgreement?: (string | VerificationMethod)[];
  capabilityInvocation?: (string | VerificationMethod)[];
  capabilityDelegation?: (string | VerificationMethod)[];
  service?: Service[];
}
export type DidDocumentOperation =
  | 'setDidDocument'
  | 'addToDidDocument'
  | 'removeFromDidDocument'
  | 'deactivate';

export interface DidDocumentMetadata {
  [key: string]: any;
}

export interface DidRegistrationMetadata {
  [key: string]: any;
}

export type Service = {
  id: string;
  type: string;
  serviceEndpoint: string | string[] | ServiceEndpoint;
};

type ServiceEndpoint = {
  uri: string;
  accept?: string[];
  routingKeys?: string[];
  [key: string]: any;
};

export type VerificationRelationship = {
  id: string;
  relationshipType: string;
  type: string;
  controller: string;
  publicKeyMultibase: string;
};

export type VerificationMethod =
  | VerificationMethodPublicData
  | VerificationMethodPrivateData;

export type Secret = {
  verificationMethod?: VerificationMethod[];
  signingResponse?: SigningResponseSet;
  decryptionResponse?: DecryptionResponseSet;
};

export type VerificationMethodPublicData = {
  id?: string;
  type: string;
  controller: string;
  purpose?: string[];
  publicKeyJwk?: JsonWebKey;
  publicKeyMultibase?: string;
};

export type VerificationMethodPrivateData = {
  id?: string;
  type: string;
  controller: string;
  purpose?: string[];
  privateKeyJwk?: JsonWebKey;
  privateKeyMultibase?: string;
};

type VerificationMethodTemplate = {
  id?: string;
  type?: string;
  controller?: string;
  purpose?: string[];
};

type SigningRequestSet = {
  [requestId: string]: {
    payload?: any;
    serializedPayload: string;
    kid?: string;
    alg: string;
    purpose?: string;
  };
};

type SigningResponseSet = {
  [requestId: string]: {
    signature: string;
    kid?: string;
    alg?: string;
    purpose?: string;
  };
};

type DecryptionRequestSet = {
  [requestId: string]: {
    payload?: any;
    encryptedPayload: string;
    kid?: string;
    enc: string;
    purpose?: string;
  };
};

type DecryptionResponseSet = {
  [requestId: string]: {
    decryptedPayload: string;
    kid?: string;
    enc?: string;
    purpose?: string;
  };
};

type JsonWebKey = {
  kty: string;
  crv?: string;
  x?: string;
  y?: string;
  e?: string;
  n?: string;
  [key: string]: any;
};
