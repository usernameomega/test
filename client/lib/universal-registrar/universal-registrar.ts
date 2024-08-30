import { Properties } from '../shared';
import { ApiClient } from '../api/client';
import {
  UniversalRegistrarError,
  UniversalRegistrarErrorResponse,
} from '../exceptions';
import {
  CreateOptions,
  DeactivateOptions,
  DIDCreationResponse,
  DIDCreationResult,
  DIDUpdateResponse,
  DIDUpdateResult,
  UpdateOptions,
} from './types';
import { constructVerificationMethod } from './utils';

interface UniversalRegistrarOptions {
  identityServiceUrl: string;
}

export class UniversalRegistrar extends ApiClient<UniversalRegistrarErrorResponse> {
  constructor(options: UniversalRegistrarOptions) {
    super({
      baseUrl: options.identityServiceUrl,
      urlPrefix: '/universal-registrar/',
      errorHandler: UniversalRegistrarError.fromResponse,
    });
  }

  async create(options: CreateOptions): Promise<DIDCreationResult> {
    const bodyContent = {
      jobId: null,
      options: {
        network: options.network,
      },
      secret: {},
      didDocument: {
        '@context': 'https://www.w3.org/ns/did/v1',
        authentication: [],
        service: [],
      },
    };

    const searchParams = new URLSearchParams();
    searchParams.set('method', options.method);

    const response = await this.fetch(`create?${searchParams.toString()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(bodyContent),
    });

    const body: DIDCreationResponse = await response.json();

    return {
      didDocument: body.didState.didDocument,
      privateKeyMultibase:
        body.didState.secret.verificationMethod[0].privateKeyMultibase,
    };
  }

  async update(options: UpdateOptions): Promise<DIDUpdateResult> {
    const verificationMethod = constructVerificationMethod(
      options.did,
      options.secret,
    );
    const bodyContent = {
      did: options.did,
      secret: {
        verificationMethod: [verificationMethod],
      },
      options: {
        network: options.network,
      },
      didDocumentOperation: options.updates.didDocumentOperation,
      didDocument: options.updates.didDocument,
    };

    const response = await this.fetch(`update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(bodyContent),
    });

    const body: DIDUpdateResponse = await response.json();

    return {
      didDocument: body.didState.didDocument,
    };
  }

  async deactivate(options: DeactivateOptions): Promise<void> {
    const verificationMethod = constructVerificationMethod(
      options.did,
      options.secret,
    );

    const bodyContent = {
      jobId: null,
      options: {},
      secret: {
        verificationMethod: [verificationMethod],
      },
      did: options.did,
    };

    await this.fetch(`deactivate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(bodyContent),
    });
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
}
