import path from 'path';

const pactDir = path.resolve(process.cwd(), 'pacts');

export const pactConfig = {
  universalResolver: {
    consumer: 'universal-resolver-client',
    provider: 'identity-service',
    contractUrl: pactDir,
  },
  universalRegistrar: {
    consumer: 'universal-registrar-client',
    provider: 'identity-service',
    contractUrl: pactDir,
  },
} as const;
