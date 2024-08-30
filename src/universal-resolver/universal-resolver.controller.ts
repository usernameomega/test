import { Controller, Get, Req, Res, UseFilters } from '@nestjs/common';
import { Request, Response } from 'express';
import UAParser from 'ua-parser-js';
import { UniversalResolverService } from './universal-resolver.service';
import { Identifier } from './decorators/identifier.decorator';
import { DIDAcceptHeader } from './decorators/accept-header.decorator';
import { ResolverExceptionFilter } from './filters/resolver.exception.filter';
import { AcceptHeader } from './types/accept-header.types';

@Controller('universal-resolver')
@UseFilters(new ResolverExceptionFilter())
export class UniversalResolverController {
  constructor(
    private readonly universalResolverService: UniversalResolverService,
  ) {}

  @Get('identifiers/:identifier')
  async resolve(
    @Identifier() identifier: string,
    @DIDAcceptHeader() accept: AcceptHeader,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.header('Content-Type', accept);
    const result = await this.universalResolverService.resolve(identifier);

    if (!result.isServiceEndpoint) {
      return result.documentOrFragment(accept);
    }

    const ua = UAParser(req.headers['user-agent']);

    if (ua.browser.name) {
      res.redirect(result.serviceEndpointUri);
      return;
    }

    return result.serviceEndpoint(accept);
  }

  @Get('/properties')
  getProperties(@Res({ passthrough: true }) res: Response) {
    res.header('Content-Type', 'application/did+json');
    return this.universalResolverService.getProperties();
  }

  @Get('/methods')
  getMethods(@Res({ passthrough: true }) res: Response) {
    res.header('Content-Type', 'application/did+json');
    return this.universalResolverService.getMethods();
  }

  @Get('testIdentifiers')
  getTestIdentifiers(@Res({ passthrough: true }) res: Response) {
    res.header('Content-Type', 'application/did+json');

    return this.universalResolverService.getTestIdentifiers();
  }
}
