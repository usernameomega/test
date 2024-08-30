import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { parse } from 'did-resolver';
import { driverProperties } from './universal-resolver.consts';
import { UniversalResolverConfig } from './universal-resolver.config';
import { TSupportedMethods } from './universal-resolver.types';
import { ResolverFactory } from './resolvers';
import { ResolverNotSupportedException } from './exceptions/resolver-not-supported.exception';

@Injectable()
export class UniversalResolverService {
  constructor(
    private readonly resolverFactory: ResolverFactory,
    private readonly configService: ConfigService<UniversalResolverConfig>,
  ) {}

  getTestIdentifiers(): Record<string, string[]> {
    const testIdentifiers = this.getMethods().reduce((result, method) => {
      result[method] = this.getTestIdentifiersByMethod(method);
      return result;
    }, {});

    return testIdentifiers;
  }

  getMethods() {
    return this.resolverFactory.availableMethods();
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

  async resolve(identifier: string) {
    const method = parse(identifier).method;
    const resolver = await this.resolverFactory.getResolver(method);

    if (!resolver) {
      throw new ResolverNotSupportedException(
        `Unsupported DID method: ${method}`,
      );
    }

    return resolver.resolve(identifier);
  }

  private getTestIdentifiersByMethod(method: TSupportedMethods) {
    const uppercaseMethod =
      method.toUpperCase() as Uppercase<TSupportedMethods>;
    const identifiers = this.configService
      .get(`${uppercaseMethod}_TEST_IDENTIFIERS`, { infer: true })
      .split(',');
    return identifiers;
  }
}
