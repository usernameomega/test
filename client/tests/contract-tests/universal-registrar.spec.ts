import { MatchersV3, PactV4 } from '@pact-foundation/pact';
import {
  DIDUpdateBuilder,
  UniversalRegistrar,
} from '../../lib/universal-registrar';
import { providerFactory } from './provider';
import {
  propertiesFixture,
  methodFixture,
  didCreatedStateFixture,
  didCreateBodyFixture,
  didDeactivateBodyFixture,
  didDeactivateStateFixture,
  didUpdateBodyFixture,
  didUpdatedStateFixture,
} from '../../../pacts/fixtures';

describe('UniversalRegistrar consumer contract tests', () => {
  let provider: PactV4;

  beforeAll(() => {
    provider = providerFactory('universalRegistrar');
  });

  describe('POST /create', () => {
    it('returns an HTTP 201 and created DID document along with private key', async () => {
      await provider
        .addInteraction()
        .uponReceiving('a request for registrar to create a DID')
        .withRequest('POST', '/universal-registrar/create', (builder) => {
          builder.headers({
            Accept: 'application/json',
            'Content-Type': 'application/json',
          });

          builder.query({
            method: 'hedera',
          });

          builder.jsonBody(MatchersV3.like(didCreateBodyFixture));
        })
        .willRespondWith(201, (builder) => {
          builder.headers({ 'Content-Type': 'application/json' });
          builder.jsonBody(MatchersV3.like(didCreatedStateFixture));
        })
        .executeTest(async (mockserver) => {
          const universalRegistrar = new UniversalRegistrar({
            identityServiceUrl: mockserver.url,
          });
          const response = await universalRegistrar.create({
            method: 'hedera',
            network: 'testnet',
          });

          expect(response.didDocument).toEqual(
            didCreatedStateFixture.didState.didDocument,
          );
          expect(response.privateKeyMultibase).toEqual(
            didCreatedStateFixture.didState.secret.verificationMethod[0]
              .privateKeyMultibase,
          );
        });
    });
  });

  describe('POST /update', () => {
    it('returns an HTTP 200 and updated DID document that is deactivated', async () => {
      const did = didUpdateBodyFixture.did;
      await provider
        .addInteraction()
        .given('a created DID with hedera method')
        .uponReceiving('a request for registrar to deactivate a DID')
        .withRequest('POST', '/universal-registrar/update', (builder) => {
          builder.headers({
            Accept: 'application/json',
            'Content-Type': 'application/json',
          });

          builder.jsonBody(MatchersV3.like(didUpdateBodyFixture));
        })
        .willRespondWith(200, (builder) => {
          builder.headers({ 'Content-Type': 'application/json' });
          builder.jsonBody(MatchersV3.like(didUpdatedStateFixture));
        })
        .executeTest(async (mockserver) => {
          const universalRegistrar = new UniversalRegistrar({
            identityServiceUrl: mockserver.url,
          });
          const response = await universalRegistrar.update({
            did,
            network: 'testnet',
            secret: {
              verificationMethodId: '#did-root-key',
              privateKeyMultibase:
                didUpdateBodyFixture.secret.verificationMethod[0]
                  .privateKeyMultibase,
            },
            updates: DIDUpdateBuilder.empty().deactivate().build(),
          });

          expect(response.didDocument).toEqual(
            didUpdatedStateFixture.didState.didDocument,
          );
        });
    });

    it('returns an HTTP 200 and updated DID document that has new service and removed verification method', async () => {
      const did = didUpdateBodyFixture.did;
      await provider
        .addInteraction()
        .given('a created DID with hedera method')
        .uponReceiving(
          'a request for registrar to add service and removed verification method a DID',
        )
        .withRequest('POST', '/universal-registrar/update', (builder) => {
          builder.headers({
            Accept: 'application/json',
            'Content-Type': 'application/json',
          });

          builder.jsonBody(MatchersV3.like(didUpdateBodyFixture));
        })
        .willRespondWith(200, (builder) => {
          builder.headers({ 'Content-Type': 'application/json' });
          builder.jsonBody(MatchersV3.like(didUpdatedStateFixture));
        })
        .executeTest(async (mockserver) => {
          const universalRegistrar = new UniversalRegistrar({
            identityServiceUrl: mockserver.url,
          });
          const response = await universalRegistrar.update({
            did,
            network: 'testnet',
            secret: {
              verificationMethodId: '#did-root-key',
              privateKeyMultibase:
                didUpdateBodyFixture.secret.verificationMethod[0]
                  .privateKeyMultibase,
            },
            updates: DIDUpdateBuilder.empty()
              .addService({
                id: `${did}#service-1`,
                type: 'ExampleService',
                serviceEndpoint: 'https://example.com',
              })
              .removeVerificationMethod(`${did}#method-1`)
              .build(),
          });

          expect(response.didDocument).toEqual(
            didUpdatedStateFixture.didState.didDocument,
          );
        });
    });

    it('returns an HTTP 200 and updated DID document that has new verification method with multibase key', async () => {
      const did = didUpdateBodyFixture.did;
      await provider
        .addInteraction()
        .given('a created DID with hedera method')
        .uponReceiving(
          'a request for registrar to add service and removed verification method a DID',
        )
        .withRequest('POST', '/universal-registrar/update', (builder) => {
          builder.headers({
            Accept: 'application/json',
            'Content-Type': 'application/json',
          });

          builder.jsonBody(MatchersV3.like(didUpdateBodyFixture));
        })
        .willRespondWith(200, (builder) => {
          builder.headers({ 'Content-Type': 'application/json' });
          builder.jsonBody(MatchersV3.like(didUpdatedStateFixture));
        })
        .executeTest(async (mockserver) => {
          const universalRegistrar = new UniversalRegistrar({
            identityServiceUrl: mockserver.url,
          });
          const response = await universalRegistrar.update({
            did,
            network: 'testnet',
            secret: {
              verificationMethodId: '#did-root-key',
              privateKeyMultibase:
                didUpdateBodyFixture.secret.verificationMethod[0]
                  .privateKeyMultibase,
            },
            updates: DIDUpdateBuilder.empty()
              .addVerificationMethod({
                id: `${did}#method-2`,
                type: 'Ed25519VerificationKey2018',
                controller: did,
                publicKeyMultibase:
                  'z5VXK3TRNZXR7FJxRtSnXNk3gWmHsdHtSVBULVQPF9ws6',
              })
              .build(),
          });

          expect(response.didDocument).toEqual(
            didUpdatedStateFixture.didState.didDocument,
          );
        });
    });

    it('returns an HTTP 200 and updated DID document that has new verification method with jwk key', async () => {
      const did = didUpdateBodyFixture.did;
      await provider
        .addInteraction()
        .given('a created DID with hedera method')
        .uponReceiving(
          'a request for registrar to add service and removed verification method a DID',
        )
        .withRequest('POST', '/universal-registrar/update', (builder) => {
          builder.headers({
            Accept: 'application/json',
            'Content-Type': 'application/json',
          });

          builder.jsonBody(MatchersV3.like(didUpdateBodyFixture));
        })
        .willRespondWith(200, (builder) => {
          builder.headers({ 'Content-Type': 'application/json' });
          builder.jsonBody(MatchersV3.like(didUpdatedStateFixture));
        })
        .executeTest(async (mockserver) => {
          const universalRegistrar = new UniversalRegistrar({
            identityServiceUrl: mockserver.url,
          });
          const response = await universalRegistrar.update({
            did,
            network: 'testnet',
            secret: {
              verificationMethodId: '#did-root-key',
              privateKeyMultibase:
                didUpdateBodyFixture.secret.verificationMethod[0]
                  .privateKeyMultibase,
            },
            updates: DIDUpdateBuilder.empty()
              .addVerificationMethod({
                id: `${did}#method-2`,
                type: 'Ed25519VerificationKey2018',
                controller: did,
                publicKeyJwk: {
                  kty: 'OKP',
                  crv: 'Ed25519',
                  x: '5VXK3TRNZXR7FJxRtSnXNk3gWmHsdHtSVBULVQPF9ws6',
                },
              })
              .build(),
          });

          expect(response.didDocument).toEqual(
            didUpdatedStateFixture.didState.didDocument,
          );
        });
    });
  });

  describe('POST /deactivate', () => {
    it('returns an HTTP 200 and deactivate DID document', async () => {
      const did = didDeactivateBodyFixture.did;
      await provider
        .addInteraction()
        .given('a created DID with hedera method')
        .uponReceiving('a request for registrar to deactivate a DID')
        .withRequest('POST', '/universal-registrar/deactivate', (builder) => {
          builder.headers({
            Accept: 'application/json',
            'Content-Type': 'application/json',
          });

          builder.jsonBody(MatchersV3.like(didDeactivateBodyFixture));
        })
        .willRespondWith(200, (builder) => {
          builder.headers({ 'Content-Type': 'application/json' });
          builder.jsonBody(MatchersV3.like(didDeactivateStateFixture));
        })
        .executeTest(async (mockserver) => {
          const universalRegistrar = new UniversalRegistrar({
            identityServiceUrl: mockserver.url,
          });
          const response = await universalRegistrar.deactivate({
            did,
            secret: {
              verificationMethodId: '#did-root-key',
              privateKeyMultibase:
                didDeactivateBodyFixture.secret.verificationMethod[0]
                  .privateKeyMultibase,
            },
          });

          expect(response).toEqual(void 0);
        });
    });
  });

  describe('GET /methods', () => {
    it('returns an HTTP 200 and a list of supported DID methods', async () => {
      await provider
        .addInteraction()
        .given('a list of supported DID methods for registrar with hedera')
        .uponReceiving('a request for resolver supported methods')
        .withRequest('GET', '/universal-registrar/methods', (builder) => {
          builder.headers({ Accept: 'application/did+json' });
        })
        .willRespondWith(200, (builder) => {
          builder.headers({
            'Content-Type': 'application/did+json',
          });
          builder.jsonBody(MatchersV3.eachLike(methodFixture));
        })
        .executeTest(async (mockserver) => {
          const universalRegistrar = new UniversalRegistrar({
            identityServiceUrl: mockserver.url,
          });
          const response = await universalRegistrar.methods();

          expect(response[0]).toEqual(methodFixture);
        });
    });
  });

  describe('GET /properties', () => {
    it('returns an HTTP 200 and a list of properties for supported methods', async () => {
      await provider
        .addInteraction()
        .given('a list of properties for hedera DID methods of registrar')
        .uponReceiving('a request for supported methods properties')
        .withRequest('GET', '/universal-registrar/properties', (builder) => {
          builder.headers({ Accept: 'application/did+json' });
        })
        .willRespondWith(200, (builder) => {
          builder.headers({
            'Content-Type': 'application/did+json',
          });
          builder.jsonBody(MatchersV3.like(propertiesFixture));
        })
        .executeTest(async (mockserver) => {
          const universalRegistrar = new UniversalRegistrar({
            identityServiceUrl: mockserver.url,
          });
          const response = await universalRegistrar.properties();

          expect(response).toEqual(propertiesFixture);
        });
    });
  });
});
