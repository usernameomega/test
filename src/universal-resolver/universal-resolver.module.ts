import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UniversalResolverService } from './universal-resolver.service';
import { UniversalResolverController } from './universal-resolver.controller';
import { config } from './universal-resolver.config';
import { ResolverFactory, HederaResolver } from './resolvers';

@Module({
  imports: [ConfigModule.forFeature(config)],
  controllers: [UniversalResolverController],
  providers: [ResolverFactory, HederaResolver, UniversalResolverService],
})
export class UniversalResolverModule {}
