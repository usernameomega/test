import { DeactivateDidDto, DidDto, UpdateDidDto } from './dtos';
import { RegistrarFactory } from './registrars';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { driverProperties } from './universal-registrar.consts';
import { UniversalRegistrarConfig } from './universal-registrar.config';

@Injectable()
export class UniversalRegistrarService {
  constructor(
    private readonly registrarFactory: RegistrarFactory,
    private readonly configService: ConfigService<UniversalRegistrarConfig>,
  ) {}

  async create(createDidDto: DidDto, method: string) {
    const registrar = await this.registrarFactory.getRegistrar(method);
    return registrar.createDid(createDidDto);
  }

  async update(updateDto: UpdateDidDto) {
    const method = updateDto.did.split(':')[1];
    const registrar = await this.registrarFactory.getRegistrar(method);
    return registrar.updateDid(updateDto);
  }

  async deactivate(deactivateDidDto: DeactivateDidDto) {
    const method = deactivateDidDto.did.split(':')[1];
    const registrar = await this.registrarFactory.getRegistrar(method);
    return registrar.deactivateDid(deactivateDidDto);
  }

  getMethods(): string[] {
    return this.registrarFactory.availableMethods();
  }

  getProperties() {
    const driversArray = Object.values(driverProperties(this.configService));
    const propertiesObject = driversArray.reduce(
      (result, properties, index) => {
        result[`driver-${index}`] = {
          http: properties,
        };

        return result;
      },
      {},
    );

    return propertiesObject;
  }
}
