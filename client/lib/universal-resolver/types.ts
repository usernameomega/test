export type ServiceEndpoint = string | Record<string, any>;

export interface Service {
  id: string;
  type: string;
  serviceEndpoint: ServiceEndpoint | ServiceEndpoint[];
  [x: string]: any;
}

export interface VerificationMethod {
  id: string;
  type: string;
  controller: string;
  publicKeyBase58?: string;
  publicKeyMultibase?: string;
}

export interface DIDDocument {
  id: string;
  alsoKnownAs?: string[];
  controller?: string | string[];
  verificationMethod?: VerificationMethod[];
  service?: Service[];
  publicKey?: VerificationMethod[];
  authentication?: (string | VerificationMethod)[];
  assertionMethod?: (string | VerificationMethod)[];
  keyAgreement?: (string | VerificationMethod)[];
  capabilityInvocation?: (string | VerificationMethod)[];
  capabilityDelegation?: (string | VerificationMethod)[];
}

export interface LdDIDDocument extends DIDDocument {
  '@context': string | string[];
}

export interface DIDFullResolution {
  '@context': string | string[];
  didResolutionMetadata: {
    contentType: string;
    [key: string]: any;
  };
  didDocument: LdDIDDocument;
  didDocumentMetadata: {
    created?: string;
    updated?: string;
    versionId?: string;
    [key: string]: any;
  };
}

export type Accept =
  | 'application/did+json'
  | 'application/did+ld+json'
  | 'application/did+cbor'
  | 'application/ld+json;profile="https://w3id.org/did-resolution"';

export interface ResolveOptions<T extends Accept> {
  accept?: T;
}

export type ResolveResult<T extends Accept> = T extends 'application/did+json'
  ? DIDDocument
  : T extends 'application/did+ld+json'
    ? LdDIDDocument
    : T extends 'application/did+cbor'
      ? string
      : T extends 'application/ld+json;profile="https://w3id.org/did-resolution"'
        ? DIDFullResolution
        : never;

export interface TestIdentifiersResult {
  [key: string]: string[];
}
