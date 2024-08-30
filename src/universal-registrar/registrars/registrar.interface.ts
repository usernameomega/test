import { DeactivateDidDto, UpdateDidDto } from '../dtos';
import { DidResponseDto } from '../dtos/did-response.dto';
import { DidDto } from '../dtos/did.dto';

export interface IRegistrar {
  createDid(dto: DidDto): Promise<DidResponseDto>;
  updateDid(dto: UpdateDidDto): Promise<DidResponseDto>;
  deactivateDid(dto: DeactivateDidDto): Promise<DidResponseDto>;
}
