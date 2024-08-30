import { ConfigService } from '@nestjs/config';
import {
  TDriverProperties,
  TSupportedMethods,
} from './universal-resolver.types';
import { UniversalResolverConfig } from './universal-resolver.config';

export const driverProperties = (
  configService: ConfigService<UniversalResolverConfig>,
): Record<TSupportedMethods, TDriverProperties> => ({
  hedera: {
    pattern: '^did:hedera:(mainnet|testnet):\\w+_(\\d\\.){2}\\d+$',
    resolverUri: configService.get('HEDERA_DID_RESOLVER_URI', { infer: true }),
    testIdentifiers: configService
      .get('HEDERA_TEST_IDENTIFIERS', { infer: true })
      .split(','),
  },
});
