import {
  Equals,
  IsArray,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { DidDocumentOperation, Secret } from '../types';

export class DidOptionsDto {
  // For now only mainnet and testnet are available
  // we will have to change it after other methods are introduced
  @IsString()
  @IsIn(['mainnet', 'testnet'])
  network: 'mainnet' | 'testnet';
}

class DidDocumentDto {
  @IsUrl()
  '@context': string;

  @IsArray()
  authentication: Array<Record<string, string>>;

  @IsArray()
  service: Array<Record<string, string>>;
}

export class DidDto {
  @IsOptional()
  @IsString()
  did?: string;

  @IsOptional()
  @Equals(null, { message: 'Job ID must be null' })
  jobId?: null;

  @ValidateNested()
  options: DidOptionsDto;

  @IsObject()
  secret: Secret;

  @IsOptional()
  @IsArray()
  @IsIn(
    [
      'setDidDocument',
      'addToDidDocument',
      'removeFromDidDocument',
      'deactivate',
    ],
    {
      each: true,
    },
  )
  didDocumentOperation?: DidDocumentOperation[];

  @ValidateNested()
  didDocument: DidDocumentDto;
}
