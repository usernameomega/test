import { PactV4 } from '@pact-foundation/pact';
import { pactConfig } from '../../../pacts/config';

export const providerFactory = (consumer: keyof typeof pactConfig) => {
  const config = pactConfig[consumer];
  return new PactV4({
    dir: config.contractUrl,
    consumer: config.consumer,
    provider: config.provider,
  });
};
