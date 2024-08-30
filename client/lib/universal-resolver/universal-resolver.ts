import {
  UniversalResolverError,
  UniversalResolverErrorResponse,
} from '../exceptions';
import { Properties } from '../shared';
import { ApiClient } from '../api/client';
import {
  Accept,
  ResolveOptions,
  ResolveResult,
  TestIdentifiersResult,
  Service,
  VerificationMethod,
} from './types';

interface UniversalResolverOptions {
  identityServiceUrl?: string;
}

export class UniversalResolver extends ApiClient<UniversalResolverErrorResponse> {
  constructor(options: UniversalResolverOptions) {
    super({
      baseUrl: options.identityServiceUrl,
      urlPrefix: '/universal-resolver/',
      errorHandler: UniversalResolverError.fromResponse,
    });
  }

  async resolve<T extends Accept>(
    did: string,
    param: ResolveOptions<T> = {
      accept: 'application/did+ld+json',
    } as ResolveOptions<T>,
  ): Promise<ResolveResult<T>> {
    const response = await this.fetch(`identifiers/${did}`, {
      method: 'GET',
      headers: { Accept: param.accept },
    });

    if (param.accept === 'application/did+cbor') {
      const cborDocument = await response.text();
      return cborDocument as ResolveResult<T>;
    }

    return response.json();
  }

  async resolveDocumentFragment(
    did: string,
    fragmentId: string,
  ): Promise<Service | VerificationMethod> {
    const response = await this.fetch(
      `identifiers/${did}${encodeURIComponent('#')}${fragmentId}`,
      {
        method: 'GET',
        headers: { Accept: 'application/did+ld+json' },
      },
    );
    return response.json();
  }

  async resolveServiceEndpoint(
    did: string,
    service: string,
    relativeRef?: string,
  ): Promise<string> {
    const searchParams = new URLSearchParams();
    searchParams.append('service', service);
    if (relativeRef) {
      searchParams.append('relativeRef', relativeRef);
    }
    const response = await this.fetch(
      `identifiers/${did}?${searchParams.toString()}`,
      {
        method: 'GET',
        headers: { Accept: 'application/did+ld+json' },
      },
    );
    return response.text();
  }

  async properties(): Promise<Properties> {
    const response = await this.fetch('properties', {
      method: 'GET',
      headers: { Accept: 'application/did+json' },
    });
    return response.json();
  }

  async methods(): Promise<string[]> {
    const response = await this.fetch('methods', {
      method: 'GET',
      headers: { Accept: 'application/did+json' },
    });
    return response.json();
  }

  async testIdentifiers(): Promise<TestIdentifiersResult> {
    const response = await this.fetch('testIdentifiers', {
      method: 'GET',
      headers: { Accept: 'application/did+json' },
    });

    return response.json();
  }
}
