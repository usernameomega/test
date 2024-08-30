import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HcsDid } from '@hashgraph/did-sdk-js';
import {
  Client,
  PrivateKey,
  AccountId,
  ReceiptStatusError,
  Status,
} from '@hashgraph/sdk';
import {
  DidResponseDto,
  DidDto,
  UpdateDidDto,
  DeactivateDidDto,
  VerificationMethodUpdateDto,
  ServiceUpdateDto,
  VerificationRelationshipUpdateDto,
} from '../../dtos';
import { IRegistrar } from '../registrar.interface';
import { UniversalRegistrarConfig } from '../../universal-registrar.config';
import { Secret, VerificationMethodPrivateData } from '../../types';
import { RegistrarBadRequestException } from '../../exceptions/registrar-bad-request.exception';
import {
  supportedProperties,
  updateFunctionsMapPerOperation,
  transformFunctions,
} from './hedera.consts';
import { RegistrarInvalidPublicKeyException } from '../../exceptions/registrar-invalid-publicKey.exception';
import { MultibaseCodec } from '../../utils/multibase.codec';
import { RegistrarInvalidSignatureException } from '../../exceptions/registrar-invalid-signature.exception';

@Injectable()
export class HederaRegistrar implements IRegistrar {
  private readonly logger = new Logger(HederaRegistrar.name);

  constructor(
    private readonly multibaseCodec: MultibaseCodec,
    private readonly configService: ConfigService<UniversalRegistrarConfig>,
  ) {}

  async createDid(dto: DidDto): Promise<DidResponseDto> {
    const client = this.createOperatorClientFor(dto.options.network);
    const privateKey = PrivateKey.generate();
    const hcsDid = new HcsDid({ client, privateKey });

    await hcsDid.register();

    return this.buildStandardDidResponse(hcsDid);
  }

  async updateDid(dto: UpdateDidDto): Promise<DidResponseDto> {
    const client = this.createOperatorClientFor(dto.options.network);
    const privateKey = this.retrievePrivateKeyFromSecret(dto.secret);
    const hcsDid = new HcsDid({ identifier: dto.did, client, privateKey });

    const propertiesToUpdate = new Set(dto.didDocument.flatMap(Object.keys));

    const incompatibleProperties = this.getIncompatibleProperties(
      [...propertiesToUpdate.values()],
      supportedProperties,
    );

    if (incompatibleProperties.length > 0) {
      throw new RegistrarBadRequestException(hcsDid.getIdentifier());
    }

    const promiseArray = [];

    for (const element of dto.didDocument) {
      const operation = this.getOperationType(element);
      const functionsPerOperation = updateFunctionsMapPerOperation(hcsDid);
      const updateFunctionsMap = functionsPerOperation[operation];

      const transformFunctionsMap = transformFunctions[operation];

      for (const [key, value] of Object.entries(element)) {
        if (!Array.isArray(value)) {
          throw new RegistrarBadRequestException(hcsDid.getIdentifier());
        }

        const updateFunction = updateFunctionsMap[key];
        const transformerFn = transformFunctionsMap?.[key];

        for (const valueFromArray of value) {
          const transformedValue =
            transformerFn?.(valueFromArray) ?? valueFromArray;

          promiseArray.push(updateFunction(transformedValue));
        }
      }
    }

    if (dto.didDocumentOperation.includes('deactivate')) {
      promiseArray.push(hcsDid.delete());
    }

    try {
      await Promise.all(promiseArray);
    } catch (e) {
      this.handleUpdateError(e, hcsDid.getIdentifier());
    }

    return this.buildStandardDidResponse(hcsDid);
  }

  async deactivateDid({
    did,
    options,
    secret,
  }: DeactivateDidDto): Promise<DidResponseDto> {
    const client = this.createOperatorClientFor(options.network);
    const privateKey = this.retrievePrivateKeyFromSecret(secret);
    const hcsDid = new HcsDid({ identifier: did, client, privateKey });

    await hcsDid.delete();

    return this.buildStandardDidResponse(hcsDid);
  }

  private retrievePrivateKeyFromSecret(secret: Secret) {
    const verificationMethod = secret
      .verificationMethod[0] as VerificationMethodPrivateData;
    const privateKeyMultibase = verificationMethod.privateKeyMultibase;
    const privateKeyJwk = verificationMethod.privateKeyJwk;

    if (privateKeyMultibase) {
      const privateKeyBytes = this.multibaseCodec.decode(privateKeyMultibase);

      return PrivateKey.fromBytesED25519(privateKeyBytes);
    }

    if (privateKeyJwk) {
      if (privateKeyJwk.kty !== 'OKP' || privateKeyJwk.crv !== 'Ed25519') {
        throw new RegistrarInvalidPublicKeyException();
      }

      const privateKeyBytes = Buffer.from(privateKeyJwk.d, 'base64url');

      return PrivateKey.fromBytesED25519(privateKeyBytes);
    }

    throw new RegistrarBadRequestException();
  }

  private handleUpdateError(e: Error, did?: string) {
    if (
      e instanceof ReceiptStatusError &&
      e.status.valueOf() === Status.InvalidSignature.valueOf()
    ) {
      throw new RegistrarInvalidSignatureException(did);
    }

    this.logger.error(e.message);
  }

  private getIncompatibleProperties(
    properties: string[],
    supportedProperties: string[],
  ) {
    return properties.filter(
      (property) => !supportedProperties.includes(property),
    );
  }

  private getOperationType(
    element:
      | VerificationMethodUpdateDto
      | ServiceUpdateDto
      | VerificationRelationshipUpdateDto,
  ) {
    // Check if element is an array of objects with only an id property
    if (
      Object.values(element).every(
        (value) =>
          Array.isArray(value) &&
          Object.values(value).every(
            (obj) => obj.hasOwnProperty('id') && Object.keys(obj).length === 1,
          ),
      )
    ) {
      return 'revoke';
    }

    return 'add';
  }

  // Will have to be changed later when we support long running jobs (jobId)
  private async buildStandardDidResponse(did: HcsDid) {
    const didDocument = (await did.resolve()).toJsonTree();

    const secretVerificationMethod = {
      id: `${did.getIdentifier()}#did-root-key`,
      type: 'Ed25519VerificationKey2020',
      controller: did.getIdentifier(),
      privateKeyMultibase: this.multibaseCodec.encode(
        did.getPrivateKey().toBytes(),
      ),
    };

    return new DidResponseDto({
      jobId: null,
      didState: {
        state: 'finished',
        did: did.getIdentifier(),
        secret: { verificationMethod: [secretVerificationMethod] },
        didDocument,
      },
      didDocumentMetadata: {},
      didRegistrationMetadata: {},
    });
  }

  private createOperatorClientFor(network: string) {
    const client = Client.forName(network, {
      scheduleNetworkUpdate: false,
    });

    const operatorPrivateKey = PrivateKey.fromStringDer(
      this.configService.get('RELAYER_PRIVATE_KEY', { infer: true }),
    );
    const operatorAccountId = AccountId.fromString(
      this.configService.get('RELAYER_ACCOUNT_ID', { infer: true }),
    );

    return client.setOperator(operatorAccountId, operatorPrivateKey);
  }
}
