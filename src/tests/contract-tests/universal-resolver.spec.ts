import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Verifier } from '@pact-foundation/pact';
import path from 'path';
import { parse } from 'did-resolver';
import {
  UniversalResolverModule,
  UniversalResolverService,
} from '../../universal-resolver';
import { ResolverResult } from '../../universal-resolver/resolvers/resolver-result.base';
import { pactConfig } from '../../../pacts/config';
import {
  documentProfileFixture,
  methodFixture,
  propertiesFixture,
  serviceEndpointFixture,
  serviceEndpointRefFixture,
  testIdentifiersFixture,
  verificationMethodFixture,
} from '../../../pacts/fixtures';

describe('UniversalResolver provider contract tests', () => {
  let app: INestApplication;
  let service: UniversalResolverService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        UniversalResolverModule,
        ConfigModule.forRoot({
          envFilePath: ['.env.test'],
        }),
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    service = moduleRef.get<UniversalResolverService>(UniversalResolverService);

    await app.init();
    await app.listen(3000, 'localhost');
  });

  afterAll(async () => {
    await app.close();
  });

  it('validates the expectations of Matching Service', async () => {
    return new Verifier({
      provider: pactConfig.universalResolver.provider,
      providerBaseUrl: await app.getUrl(),
      pactUrls: [
        path.resolve(
          pactConfig.universalResolver.contractUrl,
          `${pactConfig.universalResolver.consumer}-${pactConfig.universalResolver.provider}.json`,
        ),
      ],
      stateHandlers: {
        'a list of test DID identifiers for hedera method': () => {
          jest
            .spyOn(service, 'getTestIdentifiers')
            .mockReturnValueOnce(testIdentifiersFixture);
          return Promise.resolve();
        },
        'a list of supported DID methods for resolver with hedera': () => {
          jest
            .spyOn(service, 'getMethods')
            .mockReturnValueOnce([methodFixture]);
          return Promise.resolve();
        },
        'a list of properties for hedera DID methods of resolver': () => {
          jest
            .spyOn(service, 'getProperties')
            .mockReturnValueOnce(propertiesFixture);

          return Promise.resolve();
        },
        'a DID document with a service': () => {
          jest.spyOn(service, 'resolve').mockImplementationOnce((did) => {
            const parsedDid = parse(did);
            const params = new URLSearchParams(parsedDid.query);
            const relativeRef = params.get('relativeRef');

            if (!relativeRef) {
              return Promise.resolve(
                ResolverResult.fromServiceEndpoint(serviceEndpointFixture),
              );
            }

            return Promise.resolve(
              ResolverResult.fromServiceEndpoint(serviceEndpointRefFixture),
            );
          });

          return Promise.resolve();
        },
        'a DID document with a verification method': () => {
          jest
            .spyOn(service, 'resolve')
            .mockResolvedValueOnce(
              ResolverResult.fromResolution(verificationMethodFixture),
            );

          return Promise.resolve();
        },
        'a DID document': () => {
          jest
            .spyOn(service, 'resolve')
            .mockResolvedValueOnce(
              ResolverResult.fromResolution(documentProfileFixture),
            );

          return Promise.resolve();
        },
      },
    }).verifyProvider();
  });
});
