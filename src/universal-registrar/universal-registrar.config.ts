import { Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { IsString, validateSync } from 'class-validator';

export class UniversalRegistrarConfig {
  @IsString()
  RELAYER_ACCOUNT_ID: string;

  @IsString()
  RELAYER_PRIVATE_KEY: string;

  @IsString()
  HEDERA_DID_RESOLVER_URI: string;

  @IsString({ each: true })
  HEDERA_TEST_IDENTIFIERS: string;
}

export const config = () => {
  const logger = new Logger(UniversalRegistrarConfig.name);
  const validatedConfig = plainToInstance(
    UniversalRegistrarConfig,
    process.env,
    {
      enableImplicitConversion: true,
    },
  );
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  logger.log(`Config validated successfully.`);
  return validatedConfig;
};
