import { ConfigService } from '@nestjs/config';
import { UniversalRegistrarService } from './universal-registrar.service';
import { DidDto } from './dtos/did.dto';
import { Test, TestingModule } from '@nestjs/testing';
import { PrivateKey, PublicKey } from '@hashgraph/sdk';
import { HederaRegistrar, RegistrarFactory } from './registrars';
import { UniversalRegistrarConfig } from './universal-registrar.config';
import { addTransformerFunctions } from './registrars/hedera/hedera.consts';
import bs58 from 'bs58';
import { UpdateDidDto } from './dtos';
import { MultibaseCodec } from './utils/multibase.codec';

// Mock HcsDid class and its methods
jest.mock('@hashgraph/did-sdk-js', function () {
  return {
    HcsDid: jest.fn().mockImplementation(function () {
      return {
        register: jest.fn().mockReturnThis(),
        resolve: jest.fn().mockResolvedValue({
          toJsonTree: jest.fn().mockReturnValue({
            '@context': 'https://www.w3.org/ns/did/v1',
            id: 'did:hedera:testnet:z8brLDSMuByWYqd1A7yUhaiL8T2LKcxeUdihD4GmHdzar_0.0.4388790',
            verificationMethod: [
              {
                id: 'did:hedera:testnet:z8brLDSMuByWYqd1A7yUhaiL8T2LKcxeUdihD4GmHdzar_0.0.4388790#did-root-key',
                type: 'Ed25519VerificationKey2018',
                controller:
                  'did:hedera:testnet:z8brLDSMuByWYqd1A7yUhaiL8T2LKcxeUdihD4GmHdzar_0.0.4388790',
                publicKeyBase58: 'some-public-key',
              },
            ],
            assertionMethod: [
              'did:hedera:testnet:z8brLDSMuByWYqd1A7yUhaiL8T2LKcxeUdihD4GmHdzar_0.0.4388790#did-root-key',
            ],
            authentication: [
              'did:hedera:testnet:z8brLDSMuByWYqd1A7yUhaiL8T2LKcxeUdihD4GmHdzar_0.0.4388790#did-root-key',
            ],
          }),
        }),
        getIdentifier: jest
          .fn()
          .mockReturnValue(
            'did:hedera:testnet:z8brLDSMuByWYqd1A7yUhaiL8T2LKcxeUdihD4GmHdzar_0.0.4388790',
          ),
        getPrivateKey: jest
          .fn()
          .mockImplementation(() => PrivateKey.generate()),

        addService: jest.fn().mockReturnThis(),
        addVerificationMethod: jest.fn().mockReturnThis(),
        addVerificationRelationship: jest.fn().mockReturnThis(),
        revokeService: jest.fn().mockReturnThis(),
        revokeVerificationMethod: jest.fn().mockReturnThis(),
        revokeVerificationRelationship: jest.fn().mockReturnThis(),
      };
    }),
  };
});

describe('UniversalRegistrarService', () => {
  let service: UniversalRegistrarService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UniversalRegistrarService,
        RegistrarFactory,
        HederaRegistrar,
        MultibaseCodec,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              const config: UniversalRegistrarConfig = {
                RELAYER_PRIVATE_KEY:
                  '302e020100300506032b657004220420b2c50463be9c42f8db601c105c11c691849be69b42fe95376c9ce7ea07d82c8c',
                RELAYER_ACCOUNT_ID: '0.0.5',
                HEDERA_TEST_IDENTIFIERS:
                  'did:hedera:testnet:z8brLDSMuByWYqd1A7yUhaiL8T2LKcxeUdihD4GmHdzar_0.0.4388790,did:hedera:testnet:7Prd74ry1Uct87nZqL3ny7aR7Cg46JamVbJgk8azVgUm__0.0.12345',
                HEDERA_DID_RESOLVER_URI:
                  'https://identity-service.dev.hashgraph-group.com/',
              };
              return config[key] ?? null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<UniversalRegistrarService>(UniversalRegistrarService);
  });

  it('should return properly formatted object', async () => {
    const createDidDto: DidDto = {
      jobId: null,
      options: {
        network: 'testnet',
      },
      secret: {},
      didDocument: {
        '@context': 'https://www.w3.org/ns/did/v1',
        authentication: [],
        service: [],
      },
    };

    const actual = await service.create(createDidDto, 'hedera');

    [
      'jobId',
      'didState',
      'didDocumentMetadata',
      'didRegistrationMetadata',
    ].forEach((key) => {
      expect(actual).toHaveProperty(key);
    });

    ['state', 'did', 'secret', 'didDocument'].forEach((key) => {
      expect(actual.didState).toHaveProperty(key);
    });

    expect(actual.didState.secret).toHaveProperty('verificationMethod');
    expect(actual.didState.secret.verificationMethod).toHaveLength(1);

    ['id', 'type', 'controller', 'privateKeyMultibase'].forEach((key) => {
      expect(actual.didState.secret.verificationMethod[0]).toHaveProperty(key);
    });
  });

  it('should return PublicKey object from verification method transformer when passing publicKeyMultibase', () => {
    const privateKey = PrivateKey.generate();
    const publicKeyMultibase = `z${bs58.encode(privateKey.publicKey.toBytes())}`;
    const data = {
      id: 'did:hedera:testnet:z8brLDSMuByWYqd1A7yUhaiL8T2LKcxeUdihD4GmHdzar_0.0.4388790#did-root-key',
      type: 'Ed25519VerificationKey2020',
      controller:
        'did:hedera:testnet:z8brLDSMuByWYqd1A7yUhaiL8T2LKcxeUdihD4GmHdzar_0.0.4388790',
      publicKeyMultibase,
    };

    const verificationMethodTransformer =
      addTransformerFunctions['verificationMethod'];

    const actual = verificationMethodTransformer(data);

    expect(actual).toHaveProperty('publicKey');
    expect(actual.publicKey).toBeInstanceOf(PublicKey);
    expect(actual.publicKey.toStringRaw()).toEqual(
      privateKey.publicKey.toStringRaw(),
    );
  });

  it('should return PublicKey object from verification method transformer when passing publicKeyJwk', () => {
    const privateKey = PrivateKey.generate();
    const publicKeyJwk = {
      kty: 'OKP',
      crv: 'Ed25519',
      x: Buffer.from(privateKey.publicKey.toBytes()).toString('base64'),
      d: Buffer.from(privateKey.toBytes()).toString('base64'),
    };
    const data = {
      id: 'did:hedera:testnet:z8brLDSMuByWYqd1A7yUhaiL8T2LKcxeUdihD4GmHdzar_0.0.4388790#did-root-key',
      type: 'Ed25519VerificationKey2020',
      controller:
        'did:hedera:testnet:z8brLDSMuByWYqd1A7yUhaiL8T2LKcxeUdihD4GmHdzar_0.0.4388790',
      publicKeyJwk,
    };

    const verificationMethodTransformer =
      addTransformerFunctions['verificationMethod'];

    const actual = verificationMethodTransformer(data);

    expect(actual).toHaveProperty('publicKey');
    expect(actual.publicKey).toBeInstanceOf(PublicKey);
    expect(actual.publicKey.toStringRaw()).toEqual(
      privateKey.publicKey.toStringRaw(),
    );
  });

  it('should return run update while using provided private key multibase in secret property', async () => {
    const privateKey = PrivateKey.generate();
    const privateKeyMultibase = `z${bs58.encode(privateKey.toBytes())}`;
    const secretVerificationMethod = {
      id: 'did:hedera:testnet:z8brLDSMuByWYqd1A7yUhaiL8T2LKcxeUdihD4GmHdzar_0.0.4388790#did-root-key',
      type: 'Ed25519VerificationKey2020',
      controller:
        'did:hedera:testnet:z8brLDSMuByWYqd1A7yUhaiL8T2LKcxeUdihD4GmHdzar_0.0.4388790',
      privateKeyMultibase,
    };

    const data: UpdateDidDto = {
      jobId: null,
      did: 'did:hedera:testnet:z8brLDSMuByWYqd1A7yUhaiL8T2LKcxeUdihD4GmHdzar_0.0.4388790',
      options: {
        network: 'testnet',
      },
      secret: { verificationMethod: [secretVerificationMethod] },
      didDocumentOperation: ['addToDidDocument'],
      didDocument: [
        {
          verificationMethod: [
            {
              id: 'did:hedera:testnet:z8brLDSMuByWYqd1A7yUhaiL8T2LKcxeUdihD4GmHdzar_0.0.4388790#key-2',
              type: 'Ed25519VerificationKey2018',
              controller:
                'did:hedera:testnet:z8brLDSMuByWYqd1A7yUhaiL8T2LKcxeUdihD4GmHdzar_0.0.4388790',
              publicKeyMultibase:
                'z6MYLu1fhuwEVkk7bhZPmpa52HJ1U24GqFAw5brNp4ryH',
            },
          ],
        },
      ],
    };

    const actual = await service.update(data);

    [
      'jobId',
      'didState',
      'didDocumentMetadata',
      'didRegistrationMetadata',
    ].forEach((key) => {
      expect(actual).toHaveProperty(key);
    });
  });

  it('should return run update while using provided private key jwk in secret property', async () => {
    const privateKey = PrivateKey.generate();
    const privateKeyJwk = {
      kty: 'OKP',
      crv: 'Ed25519',
      x: Buffer.from(privateKey.publicKey.toBytes()).toString('base64'),
      d: Buffer.from(privateKey.toBytes()).toString('base64'),
    };
    const secretVerificationMethod = {
      id: 'did:hedera:testnet:z8brLDSMuByWYqd1A7yUhaiL8T2LKcxeUdihD4GmHdzar_0.0.4388790#did-root-key',
      type: 'Ed25519VerificationKey2020',
      controller:
        'did:hedera:testnet:z8brLDSMuByWYqd1A7yUhaiL8T2LKcxeUdihD4GmHdzar_0.0.4388790',
      privateKeyJwk,
    };

    const data: UpdateDidDto = {
      jobId: null,
      did: 'did:hedera:testnet:z8brLDSMuByWYqd1A7yUhaiL8T2LKcxeUdihD4GmHdzar_0.0.4388790',
      options: {
        network: 'testnet',
      },
      secret: { verificationMethod: [secretVerificationMethod] },
      didDocumentOperation: ['addToDidDocument'],
      didDocument: [
        {
          verificationMethod: [
            {
              id: 'did:hedera:testnet:z8brLDSMuByWYqd1A7yUhaiL8T2LKcxeUdihD4GmHdzar_0.0.4388790#key-2',
              type: 'Ed25519VerificationKey2018',
              controller:
                'did:hedera:testnet:z8brLDSMuByWYqd1A7yUhaiL8T2LKcxeUdihD4GmHdzar_0.0.4388790',
              publicKeyMultibase:
                'z6MYLu1fhuwEVkk7bhZPmpa52HJ1U24GqFAw5brNp4ryH',
            },
          ],
        },
      ],
    };

    const actual = await service.update(data);

    [
      'jobId',
      'didState',
      'didDocumentMetadata',
      'didRegistrationMetadata',
    ].forEach((key) => {
      expect(actual).toHaveProperty(key);
    });
  });

  it('should return an array of supported methods', () => {
    const actual = service.getMethods();
    expect(actual).toEqual(['hedera']);
  });

  describe('getProperties', () => {
    it('should return an object', () => {
      const actual = service.getProperties();
      expect(typeof actual).toBe('object');
    });

    it('should return an object with correct structure', () => {
      const actual = service.getProperties();
      const keys = Object.keys(actual);
      expect(keys.every((key) => key.startsWith('driver-'))).toBe(true);
      expect(Object.values(actual)[0]).toHaveProperty('http');

      ['resolverUri', 'pattern', 'testIdentifiers'].forEach((key) => {
        expect(actual['driver-0']['http']).toHaveProperty(key);
      });
    });

    it('should return an object with correct data for hedera', () => {
      const actual = service.getProperties();
      expect(actual).toEqual({
        'driver-0': {
          http: {
            pattern: '^did:hedera:(mainnet|testnet):\\w+_(\\d\\.){2}\\d+$',
            resolverUri: 'https://identity-service.dev.hashgraph-group.com/',
            testIdentifiers: [
              'did:hedera:testnet:z8brLDSMuByWYqd1A7yUhaiL8T2LKcxeUdihD4GmHdzar_0.0.4388790',
              'did:hedera:testnet:7Prd74ry1Uct87nZqL3ny7aR7Cg46JamVbJgk8azVgUm__0.0.12345',
            ],
          },
        },
      });
    });
  });
});
