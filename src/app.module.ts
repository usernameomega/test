import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UniversalResolverModule } from './universal-resolver';
import { UniversalRegistrarModule } from './universal-registrar/universal-registrar.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
    }),
    UniversalResolverModule,
    UniversalRegistrarModule,
  ],
})
export class AppModule {}
