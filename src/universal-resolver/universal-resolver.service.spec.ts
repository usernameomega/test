import { Test, TestingModule } from '@nestjs/testing';
import { UniversalResolverService } from './universal-resolver.service';
import { ConfigModule } from '@nestjs/config';
import { HederaResolver, ResolverFactory } from './resolvers';

describe('UniversalResolverService', () => {
  let service: UniversalResolverService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ['.env.test'],
        }),
      ],
      providers: [UniversalResolverService, ResolverFactory, HederaResolver],
    }).compile();

    service = module.get(UniversalResolverService);
  });

  describe('getTestIdentifies', () => {
    it('should return an object with arrays of test identifiers from supported methods', () => {
      const actual = service.getTestIdentifiers();

      expect(Object.keys(actual).length).toEqual(1);
      expect(Object.keys(actual)[0]).toEqual('hedera');
      expect(actual['hedera'].length).toEqual(2);
      expect(actual['hedera']).toEqual([
        'did:hedera:testnet:z8brLDSMuByWYqd1A7yUhaiL8T2LKcxeUdihD4GmHdzar_0.0.4388790',
        'did:hedera:testnet:7Prd74ry1Uct87nZqL3ny7aR7Cg46JamVbJgk8azVgUm__0.0.12345',
      ]);
    });
  });

  describe('getMethods', () => {
    it('should return an array of supported methods', () => {
      const requiredMethods = ['hedera'];
      const actual = service.getMethods();

      expect(Array.isArray(actual)).toBe(true);
      expect(actual.length).toEqual(1);
      expect(actual).toEqual(requiredMethods);
    });
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
