import { Test } from '@nestjs/testing';
import { ResolverFactory } from './resolver.factory';
import { HederaResolver } from './hedera';
import { ResolverBadRequestException } from '../exceptions/resolver-bad-request.exception';
import { ResolverNotSupportedException } from '../exceptions/resolver-not-supported.exception';
import { ResolverNotFoundException } from '../exceptions/resolver-not-found.exception';

const didDocumentMock = jest.fn();

jest.mock('@hashgraph/did-sdk-js', function () {
  return {
    HederaDidResolver: jest.fn().mockImplementation(function () {
      return {
        build: jest.fn().mockReturnValue({
          hedera: didDocumentMock,
        }),
        resolve: didDocumentMock,
      };
    }),
  };
});

describe('Resolver factory', () => {
  let resolver: ResolverFactory;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ResolverFactory, HederaResolver],
    }).compile();

    resolver = module.get<ResolverFactory>(ResolverFactory);
  });

  it('should return proper resolver for hedera method', async () => {
    const hederaResolver = await resolver.getResolver('hedera');

    expect(hederaResolver).toBeDefined();
    expect(hederaResolver instanceof HederaResolver).toBe(true);
  });

  it('should return undefined for non-existing method', async () => {
    const testResolver = await resolver.getResolver('test');

    expect(testResolver).not.toBeDefined();
  });

  it('should return all available methods', () => {
    const availableMethods = resolver.availableMethods();

    expect(availableMethods).toEqual(['hedera']);
  });

  describe('DID document dereferencing', () => {
    it('should throw not found exception if fragment is not present in document', async () => {
      const didDocumentResult = {
        didDocument: {
          id: 'did:hedera:testnet:7Prd74ry1Uct87nZqL3ny7aR7Cg46JamVbJgk8azVgUm__0.0.12345',
          '@context': 'https://www.w3.org/ns/did/v1',
          verificationMethod: [
            {
              id: 'did:hedera:testnet:z8brLDSMuByWYqd1A7yUhaiL8T2LKcxeUdihD4GmHdzar_0.0.4388790#did-root-key',
              type: 'Ed25519VerificationKey2018',
              controller:
                'did:hedera:testnet:z8brLDSMuByWYqd1A7yUhaiL8T2LKcxeUdihD4GmHdzar_0.0.4388790',
              publicKeyBase58: 'some-public-key',
            },
          ],
          service: [],
        },
        didResolutionMetadata: {},
      };

      didDocumentMock.mockReturnValue(didDocumentResult);

      const hederaResolver = await resolver.getResolver('hedera');

      await expect(
        hederaResolver.resolve(
          'did:hedera:testnet:7Prd74ry1Uct87nZqL3ny7aR7Cg46JamVbJgk8azVgUm__0.0.12345#some-fragment',
        ),
      ).rejects.toBeInstanceOf(ResolverNotFoundException);
    });

    it('should return proper fragment with full id', async () => {
      const didDocumentResult = {
        didDocument: {
          id: 'did:hedera:testnet:7Prd74ry1Uct87nZqL3ny7aR7Cg46JamVbJgk8azVgUm__0.0.12345',
          '@context': 'https://www.w3.org/ns/did/v1',
          verificationMethod: [
            {
              id: 'did:hedera:testnet:z8brLDSMuByWYqd1A7yUhaiL8T2LKcxeUdihD4GmHdzar_0.0.4388790#did-root-key',
              type: 'Ed25519VerificationKey2018',
              controller:
                'did:hedera:testnet:z8brLDSMuByWYqd1A7yUhaiL8T2LKcxeUdihD4GmHdzar_0.0.4388790',
              publicKeyBase58: 'some-public-key',
            },
          ],
          service: [
            {
              id: 'did:hedera:testnet:7Prd74ry1Uct87nZqL3ny7aR7Cg46JamVbJgk8azVgUm__0.0.12345#example-service',
              type: 'some-type',
              serviceEndpoint: 'example.com',
            },
          ],
        },
        didResolutionMetadata: {},
      };

      didDocumentMock.mockReturnValue(didDocumentResult);

      const hederaResolver = await resolver.getResolver('hedera');

      const resolvedFragment = await hederaResolver.resolve(
        'did:hedera:testnet:7Prd74ry1Uct87nZqL3ny7aR7Cg46JamVbJgk8azVgUm__0.0.12345#example-service',
      );

      expect(
        resolvedFragment.documentOrFragment('application/did+ld+json'),
      ).toEqual({
        '@context': 'https://www.w3.org/ns/did/v1',
        ...didDocumentResult.didDocument.service[0],
      });
    });

    it('should return proper fragment with alias id', async () => {
      const didDocumentResult = {
        didDocument: {
          id: 'did:hedera:testnet:7Prd74ry1Uct87nZqL3ny7aR7Cg46JamVbJgk8azVgUm__0.0.12345',
          '@context': 'https://www.w3.org/ns/did/v1',
          verificationMethod: [
            {
              id: '#did-root-key',
              type: 'Ed25519VerificationKey2018',
              controller:
                'did:hedera:testnet:z8brLDSMuByWYqd1A7yUhaiL8T2LKcxeUdihD4GmHdzar_0.0.4388790',
              publicKeyBase58: 'some-public-key',
            },
          ],
          service: [
            {
              id: 'did:hedera:testnet:7Prd74ry1Uct87nZqL3ny7aR7Cg46JamVbJgk8azVgUm__0.0.12345#example-service',
              type: 'some-type',
              serviceEndpoint: 'example.com',
            },
          ],
        },
        didResolutionMetadata: {},
      };

      didDocumentMock.mockReturnValue(didDocumentResult);

      const hederaResolver = await resolver.getResolver('hedera');

      const resolvedFragment = await hederaResolver.resolve(
        'did:hedera:testnet:7Prd74ry1Uct87nZqL3ny7aR7Cg46JamVbJgk8azVgUm__0.0.12345#did-root-key',
      );

      expect(
        resolvedFragment.documentOrFragment('application/did+ld+json'),
      ).toEqual({
        '@context': 'https://www.w3.org/ns/did/v1',
        ...didDocumentResult.didDocument.verificationMethod[0],
      });
    });

    it('should find service by full id in document and return service endpoint with relative reference', async () => {
      const didDocumentResult = {
        didDocument: {
          id: 'did:hedera:testnet:7Prd74ry1Uct87nZqL3ny7aR7Cg46JamVbJgk8azVgUm__0.0.12345',
          '@context': 'https://www.w3.org/ns/did/v1',
          verificationMethod: [
            {
              id: '#did-root-key',
              type: 'Ed25519VerificationKey2018',
              controller:
                'did:hedera:testnet:z8brLDSMuByWYqd1A7yUhaiL8T2LKcxeUdihD4GmHdzar_0.0.4388790',
              publicKeyBase58: 'some-public-key',
            },
          ],
          service: [
            {
              id: 'did:hedera:testnet:7Prd74ry1Uct87nZqL3ny7aR7Cg46JamVbJgk8azVgUm__0.0.12345#example-service',
              type: 'web',
              serviceEndpoint: 'example.com',
            },
          ],
        },
        didResolutionMetadata: {},
      };

      didDocumentMock.mockReturnValue(didDocumentResult);

      const hederaResolver = await resolver.getResolver('hedera');

      const resolverResult = await hederaResolver.resolve(
        'did:hedera:testnet:7Prd74ry1Uct87nZqL3ny7aR7Cg46JamVbJgk8azVgUm__0.0.12345?service=example-service&relativeRef=some-path',
      );

      expect(resolverResult.isServiceEndpoint).toBe(true);
      expect(resolverResult.serviceEndpointUri).toBe('example.com/some-path');
    });

    it('should find service by alias id in document and return service endpoint with relative reference', async () => {
      const didDocumentResult = {
        didDocument: {
          id: 'did:hedera:testnet:7Prd74ry1Uct87nZqL3ny7aR7Cg46JamVbJgk8azVgUm__0.0.12345',
          '@context': 'https://www.w3.org/ns/did/v1',
          verificationMethod: [
            {
              id: '#did-root-key',
              type: 'Ed25519VerificationKey2018',
              controller:
                'did:hedera:testnet:z8brLDSMuByWYqd1A7yUhaiL8T2LKcxeUdihD4GmHdzar_0.0.4388790',
              publicKeyBase58: 'some-public-key',
            },
          ],
          service: [
            {
              id: '#example-service',
              type: 'web',
              serviceEndpoint: 'example.com',
            },
          ],
        },
        didResolutionMetadata: {},
      };

      didDocumentMock.mockReturnValue(didDocumentResult);

      const hederaResolver = await resolver.getResolver('hedera');

      const resolverResult = await hederaResolver.resolve(
        'did:hedera:testnet:7Prd74ry1Uct87nZqL3ny7aR7Cg46JamVbJgk8azVgUm__0.0.12345?service=example-service&relativeRef=some-path',
      );

      expect(resolverResult.isServiceEndpoint).toBe(true);
      expect(resolverResult.serviceEndpointUri).toBe('example.com/some-path');
    });

    it('should find service by alias id in document and return service endpoint', async () => {
      const didDocumentResult = {
        didDocument: {
          id: 'did:hedera:testnet:7Prd74ry1Uct87nZqL3ny7aR7Cg46JamVbJgk8azVgUm__0.0.12345',
          '@context': 'https://www.w3.org/ns/did/v1',
          verificationMethod: [
            {
              id: '#did-root-key',
              type: 'Ed25519VerificationKey2018',
              controller:
                'did:hedera:testnet:z8brLDSMuByWYqd1A7yUhaiL8T2LKcxeUdihD4GmHdzar_0.0.4388790',
              publicKeyBase58: 'some-public-key',
            },
          ],
          service: [
            {
              id: '#example-service',
              type: 'web',
              serviceEndpoint: 'example.com',
            },
          ],
        },
        didResolutionMetadata: {},
      };

      didDocumentMock.mockReturnValue(didDocumentResult);

      const hederaResolver = await resolver.getResolver('hedera');

      const resolverResult = await hederaResolver.resolve(
        'did:hedera:testnet:7Prd74ry1Uct87nZqL3ny7aR7Cg46JamVbJgk8azVgUm__0.0.12345?service=example-service',
      );

      expect(resolverResult.isServiceEndpoint).toBe(true);
      expect(resolverResult.serviceEndpointUri).toBe('example.com/');
    });

    it('should throw not found exception if service is not present in document', async () => {
      const didDocumentResult = {
        didDocument: {
          id: 'did:hedera:testnet:7Prd74ry1Uct87nZqL3ny7aR7Cg46JamVbJgk8azVgUm__0.0.12345',
          '@context': 'https://www.w3.org/ns/did/v1',
        },
        didResolutionMetadata: {},
      };

      didDocumentMock.mockReturnValue(didDocumentResult);

      const hederaResolver = await resolver.getResolver('hedera');

      await expect(
        hederaResolver.resolve(
          'did:hedera:testnet:7Prd74ry1Uct87nZqL3ny7aR7Cg46JamVbJgk8azVgUm__0.0.12345?service=example-service&relativeRef=some-path',
        ),
      ).rejects.toBeInstanceOf(ResolverNotSupportedException);
    });

    it('should throw bad request exception if service endpoint is an array', async () => {
      const didDocumentResult = {
        didDocument: {
          id: 'did:hedera:testnet:7Prd74ry1Uct87nZqL3ny7aR7Cg46JamVbJgk8azVgUm__0.0.12345',
          '@context': 'https://www.w3.org/ns/did/v1',
          service: [
            {
              id: '#example-service',
              type: 'web',
              serviceEndpoint: ['example.com', 'example.org'],
            },
          ],
        },

        didResolutionMetadata: {},
      };

      didDocumentMock.mockReturnValue(didDocumentResult);

      const hederaResolver = await resolver.getResolver('hedera');

      await expect(
        hederaResolver.resolve(
          'did:hedera:testnet:7Prd74ry1Uct87nZqL3ny7aR7Cg46JamVbJgk8azVgUm__0.0.12345?service=example-service&relativeRef=some-path',
        ),
      ).rejects.toBeInstanceOf(ResolverBadRequestException);
    });

    it('should throw bad request exception if service endpoint is an object', async () => {
      const didDocumentResult = {
        didDocument: {
          id: 'did:hedera:testnet:7Prd74ry1Uct87nZqL3ny7aR7Cg46JamVbJgk8azVgUm__0.0.12345',
          '@context': 'https://www.w3.org/ns/did/v1',
          service: [
            {
              id: '#example-service',
              type: 'web',
              serviceEndpoint: {
                nodes: ['example.com'],
                authentication: '#auth-key',
              },
            },
          ],
        },
        didResolutionMetadata: {},
      };

      didDocumentMock.mockReturnValue(didDocumentResult);

      const hederaResolver = await resolver.getResolver('hedera');

      await expect(
        hederaResolver.resolve(
          'did:hedera:testnet:7Prd74ry1Uct87nZqL3ny7aR7Cg46JamVbJgk8azVgUm__0.0.12345?service=example-service&relativeRef=some-path',
        ),
      ).rejects.toBeInstanceOf(ResolverBadRequestException);
    });
  });
});
