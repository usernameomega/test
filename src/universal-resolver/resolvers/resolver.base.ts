import {
  DIDDocument,
  Service,
  ServiceEndpoint,
  VerificationMethod,
} from 'did-resolver';
import { ResolverNotSupportedException } from '../exceptions/resolver-not-supported.exception';
import { ResolverBadRequestException } from '../exceptions/resolver-bad-request.exception';
import { ResolverResult } from './resolver-result.base';

export abstract class Resolver {
  abstract resolve(identifier: string): Promise<ResolverResult>;

  /**
   * Get a fragment from a DID document. This method is used to extract a service or verification method from a DID document based on a fragment.
   * @param didDocument The DID document to search.
   * @param fragment The fragment to search for without the leading `#`.
   * @returns The fragment if found, otherwise `null`.
   */
  protected getFragment(
    didDocument: DIDDocument,
    fragment: string,
  ): Service | VerificationMethod | null {
    const documentPropertyKeys = Object.keys(
      didDocument,
    ) as (keyof DIDDocument)[];

    for (const key of documentPropertyKeys) {
      const service = didDocument[key];

      if (typeof service === 'string') {
        continue;
      }

      for (const item of service) {
        if (typeof item === 'string') {
          continue;
        }

        if (
          item.id === `#${fragment}` ||
          item.id === `${didDocument.id}#${fragment}`
        ) {
          return {
            '@context': didDocument['@context'],
            ...item,
          };
        }
      }
    }

    return null;
  }

  /**
   * Get a service endpoint from a DID document with appended relative reference.
   * @param didDocument The DID document to search.
   * @param query The query to search for. The query should be in the format `service=<service-id>&relativeRef=<relative-ref>`.
   * @returns The URL if found, otherwise `null`.
   */
  protected getQuery(didDocument: DIDDocument, query: string): string | null {
    const services = didDocument.service;

    if (!services) {
      throw new ResolverNotSupportedException(
        'Service not found in DID document',
      );
    }

    const params = new URLSearchParams(query);
    const serviceRef = params.get('service');
    const relativeRef = params.get('relativeRef');

    if (!serviceRef) {
      throw new ResolverBadRequestException('Service param not found in query');
    }

    for (const service of services) {
      if (!service.id.endsWith(`#${serviceRef}`)) {
        continue;
      }

      let serviceEndpoint: ServiceEndpoint;

      if (Array.isArray(service.serviceEndpoint)) {
        throw new ResolverBadRequestException(
          'Multiple service endpoints are not supported',
        );
      } else {
        serviceEndpoint = service.serviceEndpoint;
      }

      if (typeof serviceEndpoint !== 'string') {
        throw new ResolverBadRequestException(
          'This service endpoint type is not supported',
        );
      }

      const parsedUrl = serviceEndpoint.endsWith('/')
        ? serviceEndpoint
        : `${serviceEndpoint}/`;

      if (!relativeRef) {
        return parsedUrl;
      }

      return relativeRef.startsWith('/')
        ? `${parsedUrl}${relativeRef.slice(1)}`
        : `${parsedUrl}${relativeRef}`;
    }

    return null;
  }
}
