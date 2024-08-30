import {
  DIDDocument,
  DIDResolutionResult,
  Service,
  VerificationMethod,
} from 'did-resolver';
import cbor from 'cbor';
import { AcceptHeader } from '../types/accept-header.types';

type EncodeFunction = (
  data: DIDResolutionResult | Service | VerificationMethod | string,
) => DIDResolutionResult | Service | VerificationMethod | DIDDocument | string;

/**
 * Represents the result of a DID resolution.
 * This class is used to encapsulate the result of a DID resolution, and to provide a consistent
 * interface for accessing the result.
 *
 * Example:
 * ```typescript
 * const result = ResolverResult.fromResolution(didResolutionResult);
 * result.documentOrFragment('application/did+cbor');
 * ```
 * or
 * ```typescript
 * const result = ResolverResult.serviceEndpoint(dereferencedServiceEndpoint);
 * result.serviceEndpoint('application/did+json');
 * ```
 */
export class ResolverResult {
  private constructor(
    private readonly didResolutionResult: DIDResolutionResult | null,
    private readonly didFragment: Service | VerificationMethod | null,
    private readonly dereferencedServiceEndpoint: string | null,
  ) {}

  /**
   * Indicates whether the result is a service endpoint.
   * If true, the result is a service endpoint.
   * If false, the result is a DID document or a fragment.
   * @returns boolean
   */
  get isServiceEndpoint(): boolean {
    return !!this.dereferencedServiceEndpoint;
  }

  /**
   * Returns the dereferenced service endpoint URI.
   * @returns string
   */
  get serviceEndpointUri(): string {
    return this.dereferencedServiceEndpoint;
  }

  /**
   * Returns the dereferenced service endpoint with the specified content type.
   * @param accept The content type to return the service endpoint in.
   * @returns string
   */
  serviceEndpoint(accept?: AcceptHeader): string {
    const serviceEndpoint = this.dereferencedServiceEndpoint;

    if (accept === 'application/did+cbor') {
      return ResolverResult.encodeCbor(serviceEndpoint);
    }

    return serviceEndpoint;
  }

  /**
   * Returns the DID document or fragment with the specified content type.
   * @param accept The content type to return the DID document or fragment in.
   * @returns parsed DID document or fragment in the specified content type.
   */
  documentOrFragment(accept: AcceptHeader): ReturnType<EncodeFunction> {
    const result = this.didResolutionResult || this.didFragment;

    const contentTypeMap: Record<AcceptHeader, EncodeFunction> = {
      'application/did+json': ResolverResult.encodeJson,
      'application/did+ld+json': ResolverResult.encodeLdJson,
      'application/did+cbor': ResolverResult.encodeCbor,
      'application/ld+json;profile="https://w3id.org/did-resolution"': (data) =>
        data,
    };

    return contentTypeMap[accept](result);
  }

  /**
   * Encodes the given data as CBOR in hexadecimal format.
   * @param data The data to encode as CBOR.
   * @returns string
   */
  private static encodeCbor(data: object | string): string {
    return cbor.encodeOne(data).toString('hex').toUpperCase();
  }

  /**
   * Encodes the given data as plain JSON object.
   * @param data The data to encode as JSON.
   * @returns string
   */
  private static encodeJson(
    data: Exclude<Parameters<EncodeFunction>[0], string>,
  ): ReturnType<EncodeFunction> {
    const didDocument = ResolverResult.isDidDocumentProfile(data)
      ? data.didDocument
      : data;
    const parsedDidDocument = structuredClone(didDocument);
    delete parsedDidDocument['@context'];
    return parsedDidDocument;
  }

  /**
   * Encodes the given data as JSON-LD object.
   * @param data The data to encode as CBOR.
   * @returns string
   */
  private static encodeLdJson(
    data: Exclude<Parameters<EncodeFunction>[0], string>,
  ): ReturnType<EncodeFunction> {
    const didDocument = ResolverResult.isDidDocumentProfile(data)
      ? data.didDocument
      : data;
    const parsedDidDocument = structuredClone(didDocument);

    return {
      '@context':
        parsedDidDocument['@context'] || 'https://www.w3.org/ns/did/v1',
      ...parsedDidDocument,
    };
  }

  /**
   * Encodes the given data as CBOR in hexadecimal format.
   * @param data The data to encode as CBOR.
   * @returns string
   */
  private static isDidDocumentProfile(
    data: unknown,
  ): data is DIDResolutionResult {
    return typeof data === 'object' && 'didDocument' in data;
  }

  /**
   * Creates a new ResolverResult instance from a DID resolution result.
   * @param result The DID resolution result or the dereferenced fragment from DID document
   * @returns ResolverResult
   */
  static fromResolution(
    result: DIDResolutionResult | Service | VerificationMethod,
  ): ResolverResult {
    if ('id' in result) {
      return new ResolverResult(null, result, null);
    }

    return new ResolverResult(result, null, null);
  }

  /**
   * Creates a new ResolverResult instance from a dereferenced service endpoint.
   * @param endpoint The service endpoint URI.
   * @returns ResolverResult
   */
  static fromServiceEndpoint(endpoint: string): ResolverResult {
    return new ResolverResult(null, null, endpoint);
  }
}
