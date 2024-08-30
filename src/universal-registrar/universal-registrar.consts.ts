import { ConfigService } from '@nestjs/config';
import {
  TDriverProperties,
  TSupportedMethods,
} from './universal-registrar.types';
import { UniversalRegistrarConfig } from './universal-registrar.config';

export const driverProperties = (
  configService: ConfigService<UniversalRegistrarConfig>,
): Record<TSupportedMethods, TDriverProperties> => ({
  hedera: {
    pattern: '^did:hedera:(mainnet|testnet):\\w+_(\\d\\.){2}\\d+$',
    resolverUri: configService.get('HEDERA_DID_RESOLVER_URI', { infer: true }),
    testIdentifiers: configService
      .get('HEDERA_TEST_IDENTIFIERS', { infer: true })
      .split(','),
  },
});
