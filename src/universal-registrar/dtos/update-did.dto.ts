import {
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { DidDto } from './did.dto';
import { OmitType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { ClassArrayType } from '../decorators/array-type.decorator';

export class VerificationMethodUpdateDto {
  @ValidateNested({ each: true })
  @Type((typeHelper) => {
    return Object.keys(typeHelper.object.verificationMethod[0]).length === 1
      ? RemoveVerificationMethodDto
      : CreateVerificationMethodDto;
  })
  verificationMethod:
    | CreateVerificationMethodDto[]
    | RemoveVerificationMethodDto[];
}

export class ServiceUpdateDto {
  @ValidateNested({ each: true })
  @Type((typeHelper) => {
    return Object.keys(typeHelper.object.service[0]).length === 1
      ? RemoveServiceDto
      : CreateServiceDto;
  })
  service: CreateServiceDto[] | RemoveServiceDto[];
}

export class VerificationRelationshipUpdateDto {
  @ValidateNested({ each: true })
  @Type((typeHelper) => {
    return Object.keys(typeHelper.object.verificationRelationship[0]).length ===
      1
      ? RemoveVerificationRelationshipDto
      : CreateVerificationRelationshipDto;
  })
  verificationRelationship:
    | CreateVerificationRelationshipDto[]
    | RemoveVerificationRelationshipDto[];
}

export class Ed25519KeyJwkDto {
  @IsString()
  @IsIn(['OKP'])
  kty: string;

  @IsString()
  @IsIn(['Ed25519'])
  crv: string;

  @IsString()
  x: string;
}

export class CreateVerificationMethodDto {
  @IsString()
  id: string;

  @IsString()
  @IsIn(['Ed25519VerificationKey2020'])
  type: string;

  @IsString()
  controller: string;

  @ValidateIf((obj) => !obj.publicKeyJwk)
  @IsString()
  publicKeyMultibase?: string;

  @ValidateIf((obj) => !obj.publicKeyMultibase)
  @ValidateNested()
  publicKeyJwk?: Ed25519KeyJwkDto;
}

export class RemoveVerificationMethodDto {
  @IsString()
  id: string;
}

export class CreateServiceDto {
  @IsString()
  id: string;

  @IsString()
  type: string;

  @IsString()
  serviceEndpoint: string;
}

export class RemoveServiceDto {
  @IsString()
  id: string;
}

export class CreateVerificationRelationshipDto {
  @IsString()
  id: string;

  @IsString()
  verificationMethod: string;
}

export class RemoveVerificationRelationshipDto {
  @IsString()
  id: string;
}

export class UpdateDidDto extends OmitType(DidDto, [
  'didDocument',
  'did',
] as const) {
  @IsString()
  did: string;

  @IsArray()
  @IsOptional()
  @ClassArrayType({
    verificationMethod: VerificationMethodUpdateDto,
    service: ServiceUpdateDto,
    verificationRelationship: VerificationRelationshipUpdateDto,
  })
  didDocument?: (
    | VerificationMethodUpdateDto
    | ServiceUpdateDto
    | VerificationRelationshipUpdateDto
  )[];
}
