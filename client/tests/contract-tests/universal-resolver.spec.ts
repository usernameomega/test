import { MatchersV3, PactV4 } from '@pact-foundation/pact';
import { UniversalResolver } from '../../lib/universal-resolver';
import { providerFactory } from './provider';
import {
  documentCborFixture,
  documentFixture,
  documentProfileFixture,
  ldDocumentFixture,
  verificationMethodFixture,
  serviceEndpointFixture,
  serviceEndpointRefFixture,
  propertiesFixture,
  methodFixture,
  testIdentifiersFixture,
} from '../../../pacts/fixtures';

describe('UniversalResolver consumer contract tests', () => {
  let universalResolver: UniversalResolver;
  let provider: PactV4;

  beforeAll(() => {
    provider = providerFactory('universalResolver');
  });

  describe('GET /testIdentifiers', () => {
    it('returns an HTTP 200 and a list of test DID identifiers', async () => {
      await provider
        .addInteraction()
        .given('a list of test DID identifiers for hedera method')
        .uponReceiving('a request for resolver test identifiers')
        .withRequest(
          'GET',
          '/universal-resolver/testIdentifiers',
          (builder) => {
            builder.headers({ Accept: 'application/did+json' });
          },
        )
        .willRespondWith(200, (builder) => {
          builder.headers({ 'Content-Type': 'application/did+json' });
          builder.jsonBody(MatchersV3.like(testIdentifiersFixture));
        })
        .executeTest(async (mockserver) => {
          universalResolver = new UniversalResolver({
            identityServiceUrl: mockserver.url,
          });
          const response = await universalResolver.testIdentifiers();

          expect(response).toEqual(testIdentifiersFixture);
        });
    });
  });

  describe('GET /methods', () => {
    it('returns an HTTP 200 and a list of supported DID methods', async () => {
      await provider
        .addInteraction()
        .given('a list of supported DID methods for resolver with hedera')
        .uponReceiving('a request for resolver supported methods')
        .withRequest('GET', '/universal-resolver/methods', (builder) => {
          builder.headers({ Accept: 'application/did+json' });
        })
        .willRespondWith(200, (builder) => {
          builder.headers({ 'Content-Type': 'application/did+json' });
          builder.jsonBody(MatchersV3.eachLike(methodFixture));
        })
        .executeTest(async (mockserver) => {
          universalResolver = new UniversalResolver({
            identityServiceUrl: mockserver.url,
          });
          const response = await universalResolver.methods();

          expect(response[0]).toEqual(methodFixture);
        });
    });
  });

  describe('GET /properties', () => {
    it('returns an HTTP 200 and a list of properties for supported methods', async () => {
      await provider
        .addInteraction()
        .given('a list of properties for hedera DID methods of resolver')
        .uponReceiving('a request for supported methods properties')
        .withRequest('GET', '/universal-resolver/properties', (builder) => {
          builder.headers({ Accept: 'application/did+json' });
        })
        .willRespondWith(200, (builder) => {
          builder.headers({ 'Content-Type': 'application/did+json' });
          builder.jsonBody(MatchersV3.like(propertiesFixture));
        })
        .executeTest(async (mockserver) => {
          universalResolver = new UniversalResolver({
            identityServiceUrl: mockserver.url,
          });
          const response = await universalResolver.properties();

          expect(response).toEqual(propertiesFixture);
        });
    });
  });

  describe('GET /identifiers with service dereferencing', () => {
    it('returns an HTTP 200 and a service endpoint', async () => {
      const did =
        'did:hedera:testnet:z6MknSnvSESWvijDEysG1wHGnaiZSLSkQEXMECWvXWnd1uaJ_0.0.1723780';
      await provider
        .addInteraction()
        .given('a DID document with a service')
        .uponReceiving('a request for dereferencing a service endpoint')
        .withRequest(
          'GET',
          `/universal-resolver/identifiers/${did}`,
          (builder) => {
            builder.headers({ Accept: 'application/did+ld+json' });
            builder.query({
              service: 'service-1',
            });
          },
        )
        .willRespondWith(200, (builder) => {
          builder.headers({ 'Content-Type': 'application/did+ld+json' });
          builder.body('text/plain', Buffer.from(serviceEndpointFixture));
        })
        .executeTest(async (mockserver) => {
          universalResolver = new UniversalResolver({
            identityServiceUrl: mockserver.url,
          });
          const response = await universalResolver.resolveServiceEndpoint(
            did,
            'service-1',
          );

          expect(response).toEqual(serviceEndpointFixture);
        });
    });

    it('returns an HTTP 200 and a service endpoint with relative reference', async () => {
      const did =
        'did:hedera:testnet:z6MknSnvSESWvijDEysG1wHGnaiZSLSkQEXMECWvXWnd1uaJ_0.0.1723780';
      await provider
        .addInteraction()
        .given('a DID document with a service')
        .uponReceiving(
          'a request for dereferencing a service endpoint with relative reference',
        )
        .withRequest(
          'GET',
          `/universal-resolver/identifiers/${did}`,
          (builder) => {
            builder.headers({ Accept: 'application/did+ld+json' });
            builder.query({
              service: 'service-1',
              relativeRef: 'some-path',
            });
          },
        )
        .willRespondWith(200, (builder) => {
          builder.headers({ 'Content-Type': 'application/did+ld+json' });
          builder.body('text/plain', Buffer.from(serviceEndpointRefFixture));
        })
        .executeTest(async (mockserver) => {
          universalResolver = new UniversalResolver({
            identityServiceUrl: mockserver.url,
          });
          const response = await universalResolver.resolveServiceEndpoint(
            did,
            'service-1',
            'some-path',
          );

          expect(response).toEqual(serviceEndpointRefFixture);
        });
    });
  });

  describe('GET /identifiers with fragment dereferencing', () => {
    it('returns an HTTP 200 and a dereferenced document fragment', async () => {
      const did =
        'did:hedera:testnet:z6MknSnvSESWvijDEysG1wHGnaiZSLSkQEXMECWvXWnd1uaJ_0.0.1723780';
      await provider
        .addInteraction()
        .given('a DID document with a verification method')
        .uponReceiving('a request for dereference a document fragment')
        .withRequest(
          'GET',
          `/universal-resolver/identifiers/${did}%23root-key`,
          (builder) => {
            builder.headers({ Accept: 'application/did+ld+json' });
          },
        )
        .willRespondWith(200, (builder) => {
          builder.headers({ 'Content-Type': 'application/did+ld+json' });
          builder.jsonBody(MatchersV3.like(verificationMethodFixture));
        })
        .executeTest(async (mockserver) => {
          universalResolver = new UniversalResolver({
            identityServiceUrl: mockserver.url,
          });
          const response = await universalResolver.resolveDocumentFragment(
            did,
            'root-key',
          );

          expect(response).toEqual(verificationMethodFixture);
        });
    });
  });

  describe('GET /identifiers', () => {
    it('returns an HTTP 200 and a resolved DID document in JSON-LD format', async () => {
      const did =
        'did:hedera:testnet:z6MknSnvSESWvijDEysG1wHGnaiZSLSkQEXMECWvXWnd1uaJ_0.0.1723780';
      await provider
        .addInteraction()
        .given('a DID document')
        .uponReceiving(
          'a request for resolving a DID document in JSON-LD format',
        )
        .withRequest(
          'GET',
          `/universal-resolver/identifiers/${did}`,
          (builder) => {
            builder.headers({ Accept: 'application/did+ld+json' });
          },
        )
        .willRespondWith(200, (builder) => {
          builder.headers({ 'Content-Type': 'application/did+ld+json' });
          builder.jsonBody(MatchersV3.like(ldDocumentFixture));
        })
        .executeTest(async (mockserver) => {
          universalResolver = new UniversalResolver({
            identityServiceUrl: mockserver.url,
          });
          const response = await universalResolver.resolve(did, {
            accept: 'application/did+ld+json',
          });

          expect(response).toEqual(ldDocumentFixture);
        });
    });

    it('returns an HTTP 200 and a resolved DID document in JSON format', async () => {
      const did =
        'did:hedera:testnet:z6MknSnvSESWvijDEysG1wHGnaiZSLSkQEXMECWvXWnd1uaJ_0.0.1723780';
      await provider
        .addInteraction()
        .given('a DID document')
        .uponReceiving('a request for resolving a DID document in JSON format')
        .withRequest(
          'GET',
          `/universal-resolver/identifiers/${did}`,
          (builder) => {
            builder.headers({ Accept: 'application/did+json' });
          },
        )
        .willRespondWith(200, (builder) => {
          builder.headers({ 'Content-Type': 'application/did+json' });
          builder.jsonBody(MatchersV3.like(documentFixture));
        })
        .executeTest(async (mockserver) => {
          universalResolver = new UniversalResolver({
            identityServiceUrl: mockserver.url,
          });
          const response = await universalResolver.resolve(did, {
            accept: 'application/did+json',
          });

          expect(response).toEqual(documentFixture);
        });
    });

    it('returns an HTTP 200 and a resolved DID document full profile', async () => {
      const did =
        'did:hedera:testnet:z6MknSnvSESWvijDEysG1wHGnaiZSLSkQEXMECWvXWnd1uaJ_0.0.1723780';
      await provider
        .addInteraction()
        .given('a DID document')
        .uponReceiving('a request for resolving a DID document full profile')
        .withRequest(
          'GET',
          `/universal-resolver/identifiers/${did}`,
          (builder) => {
            builder.headers({
              Accept:
                'application/ld+json;profile="https://w3id.org/did-resolution"',
            });
          },
        )
        .willRespondWith(200, (builder) => {
          builder.headers({
            'Content-Type':
              'application/ld+json;profile="https://w3id.org/did-resolution"',
          });
          builder.jsonBody(MatchersV3.like(documentProfileFixture));
        })
        .executeTest(async (mockserver) => {
          universalResolver = new UniversalResolver({
            identityServiceUrl: mockserver.url,
          });
          const response = await universalResolver.resolve(did, {
            accept:
              'application/ld+json;profile="https://w3id.org/did-resolution"',
          });

          expect(response).toEqual(documentProfileFixture);
        });
    });

    it('returns an HTTP 200 and a resolved DID document in CBOR format', async () => {
      const did =
        'did:hedera:testnet:z6MknSnvSESWvijDEysG1wHGnaiZSLSkQEXMECWvXWnd1uaJ_0.0.1723780';
      await provider
        .addInteraction()
        .given('a DID document')
        .uponReceiving('a request for resolving a DID document in CBOR format')
        .withRequest(
          'GET',
          `/universal-resolver/identifiers/${did}`,
          (builder) => {
            builder.headers({
              Accept: 'application/did+cbor',
            });
          },
        )
        .willRespondWith(200, (builder) => {
          builder.headers({
            'Content-Type': 'application/did+cbor',
          });
          builder.body('text/plain', Buffer.from(documentCborFixture));
        })
        .executeTest(async (mockserver) => {
          universalResolver = new UniversalResolver({
            identityServiceUrl: mockserver.url,
          });
          const response = await universalResolver.resolve(did, {
            accept: 'application/did+cbor',
          });

          expect(response).toEqual(documentCborFixture);
        });
    });
  });
});
