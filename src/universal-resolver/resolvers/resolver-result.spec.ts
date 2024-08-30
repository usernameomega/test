import { ResolverResult } from './resolver-result.base';

describe('Resolver result', () => {
  it('should return fale for isServiceEndpoint for did document result', () => {
    const resolverResult = ResolverResult.fromResolution({
      '@context': 'https://w3id.org/did-resolution/v1',
      didResolutionMetadata: {
        contentType: 'application/did+json',
      },
      didDocumentMetadata: {},
      didDocument: {
        '@context': 'https://www.w3.org/ns/did/v1',
        id: 'did:example:123',
        verificationMethod: [],
      },
    });

    expect(resolverResult.isServiceEndpoint).toBe(false);
  });

  it('should return true for isServiceEndpoint for service endpoint result', () => {
    const resolverResult = ResolverResult.fromServiceEndpoint(
      'https://example.com/endpoint',
    );

    expect(resolverResult.isServiceEndpoint).toBe(true);
  });

  it('should return service endpoint in cbor format', () => {
    const resolverResult = ResolverResult.fromServiceEndpoint(
      'https://example.com/endpoint',
    );

    expect(resolverResult.serviceEndpoint('application/did+cbor')).toBe(
      '781C68747470733A2F2F6578616D706C652E636F6D2F656E64706F696E74',
    );
  });

  it('should return service endpoint uri', () => {
    const resolverResult = ResolverResult.fromServiceEndpoint(
      'https://example.com/endpoint',
    );

    expect(resolverResult.serviceEndpointUri).toBe(
      'https://example.com/endpoint',
    );
  });

  describe('resolution result content type', () => {
    let resolverResult: ResolverResult;

    beforeAll(() => {
      resolverResult = ResolverResult.fromResolution({
        '@context': 'https://w3id.org/did-resolution/v1',
        didResolutionMetadata: {
          contentType: 'application/did+json',
        },
        didDocumentMetadata: {},
        didDocument: {
          '@context': 'https://www.w3.org/ns/did/v1',
          id: 'did:example:123',
          verificationMethod: [
            {
              id: 'did:example:123#key-1',
              type: 'Ed25519VerificationKey2018',
              controller: 'did:example:123',
              publicKeyBase58: 'base58-key-1',
            },
          ],
        },
      });
    });

    it('should return DID document in JSON format', () => {
      const result = resolverResult.documentOrFragment('application/did+json');
      expect(result).toEqual({
        id: 'did:example:123',
        verificationMethod: [
          {
            id: 'did:example:123#key-1',
            type: 'Ed25519VerificationKey2018',
            controller: 'did:example:123',
            publicKeyBase58: 'base58-key-1',
          },
        ],
      });
    });

    it('should return DID document in JSON-LD format', () => {
      const result = resolverResult.documentOrFragment(
        'application/did+ld+json',
      );
      expect(result).toEqual({
        '@context': 'https://www.w3.org/ns/did/v1',
        id: 'did:example:123',
        verificationMethod: [
          {
            id: 'did:example:123#key-1',
            type: 'Ed25519VerificationKey2018',
            controller: 'did:example:123',
            publicKeyBase58: 'base58-key-1',
          },
        ],
      });
    });

    it('should return DID document in CBOR format', () => {
      const result = resolverResult.documentOrFragment('application/did+cbor');
      expect(result).toEqual(
        'A46840636F6E74657874782268747470733A2F2F773369642E6F72672F6469642D7265736F6C7574696F6E2F7631756469645265736F6C7574696F6E4D65746164617461A16B636F6E74656E7454797065746170706C69636174696F6E2F6469642B6A736F6E73646964446F63756D656E744D65746164617461A06B646964446F63756D656E74A36840636F6E74657874781C68747470733A2F2F7777772E77332E6F72672F6E732F6469642F76316269646F6469643A6578616D706C653A31323372766572696669636174696F6E4D6574686F6481A4626964756469643A6578616D706C653A313233236B65792D316474797065781A45643235353139566572696669636174696F6E4B6579323031386A636F6E74726F6C6C65726F6469643A6578616D706C653A3132336F7075626C69634B65794261736535386C6261736535382D6B65792D31',
      );
    });

    it('should return DID document in JSON-LD format with did-resolution profile', () => {
      const result = resolverResult.documentOrFragment(
        'application/ld+json;profile="https://w3id.org/did-resolution"',
      );
      expect(result).toEqual({
        '@context': 'https://w3id.org/did-resolution/v1',
        didResolutionMetadata: {
          contentType: 'application/did+json',
        },
        didDocumentMetadata: {},
        didDocument: {
          '@context': 'https://www.w3.org/ns/did/v1',
          id: 'did:example:123',
          verificationMethod: [
            {
              id: 'did:example:123#key-1',
              type: 'Ed25519VerificationKey2018',
              controller: 'did:example:123',
              publicKeyBase58: 'base58-key-1',
            },
          ],
        },
      });
    });
  });
});
