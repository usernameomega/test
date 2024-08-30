import { Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { IsString, validateSync } from 'class-validator';

export class UniversalResolverConfig {
  @IsString()
  HEDERA_DID_RESOLVER_URI: string;

  @IsString({ each: true })
  HEDERA_TEST_IDENTIFIERS: string;
}

export const config = () => {
  const logger = new Logger(UniversalResolverConfig.name);
  const validatedConfig = plainToInstance(
    UniversalResolverConfig,
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
