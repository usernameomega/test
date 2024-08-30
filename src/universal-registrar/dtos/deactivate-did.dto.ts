import { PickType } from '@nestjs/mapped-types';
import { DidDto } from './did.dto';

export class DeactivateDidDto extends PickType(DidDto, [
  'did',
  'options',
  'secret',
] as const) {}
