import { Injectable, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { TSupportedMethods } from '../universal-resolver.types';
import { Resolver } from './resolver.base';
import { HederaResolver } from './hedera';

@Injectable()
export class ResolverFactory {
  private readonly resolversMap: Record<TSupportedMethods, Type<Resolver>> = {
    hedera: HederaResolver,
  };

  constructor(private readonly moduleRef: ModuleRef) {}

  async getResolver(didMethod: string): Promise<Resolver | undefined> {
    if (!this.resolversMap[didMethod]) {
      return;
    }

    const registrar = await this.moduleRef.resolve(
      this.resolversMap[didMethod],
    );

    return registrar;
  }

  availableMethods(): TSupportedMethods[] {
    return Object.keys(this.resolversMap) as TSupportedMethods[];
  }
}
