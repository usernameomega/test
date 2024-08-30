import { Injectable, Type } from '@nestjs/common';
import { HederaRegistrar } from './hedera/hedera.registrar';
import { IRegistrar } from './registrar.interface';
import { ModuleRef } from '@nestjs/core';
import { RegistrarMethodNotSupportedException } from '../exceptions/registrar-method-not-supported.exception';

@Injectable()
export class RegistrarFactory {
  private readonly registrarsMap: Record<string, Type<IRegistrar>> = {
    hedera: HederaRegistrar,
  };

  constructor(private readonly moduleRef: ModuleRef) {}

  async getRegistrar(didMethod: string): Promise<IRegistrar> {
    if (!this.registrarsMap[didMethod]) {
      throw new RegistrarMethodNotSupportedException();
    }

    const registrar = await this.moduleRef.resolve(
      this.registrarsMap[didMethod],
    );

    return registrar;
  }

  availableMethods(): string[] {
    return Object.keys(this.registrarsMap);
  }
}
