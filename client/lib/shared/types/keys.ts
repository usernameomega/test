export type PrivateKeyMultibase = string;

export interface PrivateKeyJwk {
  kty: 'OKP';
  crv: 'Ed25519';
  x?: string;
  d: string;
}

export interface PublicKeyJwk {
  kty: 'OKP';
  crv: 'Ed25519';
  x: string;
}
