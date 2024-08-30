import { UniversalRegistrar } from './universal-registrar';
import { UniversalResolver } from './universal-resolver';

interface ClientOptions {
  identityServiceUrl?: string;
}

export class Client {
  public readonly registrar: UniversalRegistrar;
  public readonly resolver: UniversalResolver;

  constructor(options: ClientOptions) {
    const identityServiceUrl =
      options.identityServiceUrl ??
      'https://identity-service.dev.hashgraph-group.com';

    this.registrar = new UniversalRegistrar({
      identityServiceUrl,
    });
    this.resolver = new UniversalResolver({
      identityServiceUrl,
    });
  }
}
