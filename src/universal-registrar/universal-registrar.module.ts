import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UniversalRegistrarService } from './universal-registrar.service';
import { UniversalRegistrarController } from './universal-registrar.controller';
import { RegistrarFactory, HederaRegistrar } from './registrars';
import { config } from './universal-registrar.config';
import { MultibaseCodec } from './utils/multibase.codec';

@Module({
  imports: [ConfigModule.forFeature(config)],
  controllers: [UniversalRegistrarController],
  providers: [
    UniversalRegistrarService,
    RegistrarFactory,
    HederaRegistrar,
    MultibaseCodec,
  ],
})
export class UniversalRegistrarModule {}
