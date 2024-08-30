import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Verifier } from '@pact-foundation/pact';
import path from 'path';
import { pactConfig } from '../../../pacts/config';
import {
  didCreatedStateFixture,
  didDeactivateStateFixture,
  didUpdatedStateFixture,
  methodFixture,
  propertiesFixture,
} from '../../../pacts/fixtures';
import { UniversalRegistrarService } from '../../universal-registrar/universal-registrar.service';
import { UniversalRegistrarModule } from '../../universal-registrar/universal-registrar.module';

describe('UniversalRegistrar provider contract tests', () => {
  let app: INestApplication;
  let service: UniversalRegistrarService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        UniversalRegistrarModule,
        ConfigModule.forRoot({
          envFilePath: ['.env.test'],
        }),
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    service = moduleRef.get<UniversalRegistrarService>(
      UniversalRegistrarService,
    );

    await app.init();
    await app.listen(3001, 'localhost');
  });

  afterAll(async () => {
    await app.close();
  });

  it('validates the expectations of Matching Service', async () => {
    jest
      .spyOn(service, 'deactivate')
      .mockResolvedValue(didDeactivateStateFixture as any);

    jest
      .spyOn(service, 'update')
      .mockResolvedValue(didUpdatedStateFixture as any);

    jest
      .spyOn(service, 'create')
      .mockResolvedValue(didCreatedStateFixture as any);

    return new Verifier({
      provider: pactConfig.universalRegistrar.provider,
      providerBaseUrl: await app.getUrl(),
      pactUrls: [
        path.resolve(
          pactConfig.universalRegistrar.contractUrl,
          `${pactConfig.universalRegistrar.consumer}-${pactConfig.universalRegistrar.provider}.json`,
        ),
      ],
      stateHandlers: {
        'a list of supported DID methods for registrar with hedera': () => {
          jest
            .spyOn(service, 'getMethods')
            .mockReturnValueOnce([methodFixture]);
          return Promise.resolve();
        },
        'a list of properties for hedera DID methods of registrar': () => {
          jest
            .spyOn(service, 'getProperties')
            .mockReturnValueOnce(propertiesFixture);

          return Promise.resolve();
        },
      },
    }).verifyProvider();
  });
});
