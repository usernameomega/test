import { HederaDidResolver } from '@hashgraph/did-sdk-js';
import {
  DIDDocument,
  DIDResolutionResult,
  Resolver as DIDResolver,
  parse,
} from 'did-resolver';
import { Resolver } from '../resolver.base';
import { ResolverBadRequestException } from '../../exceptions/resolver-bad-request.exception';
import { ResolverResult } from '../resolver-result.base';
import { ResolverNotFoundException } from '../../exceptions/resolver-not-found.exception';
import { ResolverNotSupportedException } from '../../exceptions/resolver-not-supported.exception';
import { ResolverInternalErrorException } from '../../exceptions/resolver-internal-error.exception';

export class HederaResolver extends Resolver {
  async resolve(identifier: string): Promise<ResolverResult> {
    const resolver = new DIDResolver({
      ...new HederaDidResolver().build(),
    });

    const didParts = parse(identifier);
    const parts = identifier.split(':');
    const network = parts[2];

    if (network !== 'testnet' && network !== 'mainnet') {
      throw new ResolverBadRequestException(
        'Invalid network, only testnet and mainnet are supported',
      );
    }
    const didResult = await resolver.resolve(identifier, {
      accept: 'application/ld+json;profile="https://w3id.org/did-resolution"',
    });

    if (didResult.didResolutionMetadata.error) {
      return this.handleDidDocumentError(didResult);
    }

    const isDidUrlType = didParts.didUrl !== didParts.did;

    if (!isDidUrlType || didResult.didResolutionMetadata.error) {
      return ResolverResult.fromResolution(didResult);
    }

    const didDocument = didResult.didDocument;

    if (!!didParts.fragment) {
      return this.dereferenceFragment(didDocument, didParts.fragment);
    }

    if (!!didParts.query) {
      return this.dereferenceQuery(didDocument, didParts.query);
    }

    return ResolverResult.fromResolution(didResult);
  }

  private async dereferenceFragment(
    didDocument: DIDDocument,
    fragment: string,
  ): Promise<ResolverResult> {
    const selectedFragment = this.getFragment(didDocument, fragment);

    if (!selectedFragment) {
      throw new ResolverNotFoundException('Fragment not found in DID document');
    }

    return ResolverResult.fromResolution(selectedFragment);
  }

  private async dereferenceQuery(
    didDocument: DIDDocument,
    query: string,
  ): Promise<ResolverResult> {
    const serviceWithRef = this.getQuery(didDocument, query);

    if (!serviceWithRef) {
      throw new ResolverNotFoundException('Query not found in DID document');
    }

    return ResolverResult.fromServiceEndpoint(serviceWithRef);
  }

  private async handleDidDocumentError(
    resolutionResult: DIDResolutionResult,
  ): Promise<ResolverResult> {
    const error = resolutionResult.didResolutionMetadata.error;

    if (!error) {
      return;
    }

    const exceptionMap = {
      invalidDid: ResolverBadRequestException,
      notFound: ResolverNotFoundException,
      unsupportedDidMethod: ResolverNotSupportedException,
    };

    const ExceptionClass =
      exceptionMap[error] ?? ResolverInternalErrorException;

    const errorMessage =
      resolutionResult.didResolutionMetadata.message ?? 'Internal error';

    throw new ExceptionClass(errorMessage);
  }
}
