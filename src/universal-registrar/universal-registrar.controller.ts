import {
  Body,
  Controller,
  Get,
  Header,
  Post,
  Query,
  UseFilters,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UniversalRegistrarService } from './universal-registrar.service';
import { RegistrarExceptionFilter } from './filters/registrar.exception.filter';
import { DidDto, UpdateDidDto, DeactivateDidDto } from './dtos';

@UseFilters(new RegistrarExceptionFilter())
@UsePipes(new ValidationPipe())
@Controller('universal-registrar')
export class UniversalRegistrarController {
  constructor(
    private readonly universalRegistrarService: UniversalRegistrarService,
  ) {}

  @Post('create')
  async create(@Query('method') method: string, @Body() createDidDto: DidDto) {
    const response = await this.universalRegistrarService.create(
      createDidDto,
      method,
    );

    return response;
  }

  @Post('update')
  @HttpCode(HttpStatus.OK)
  async update(@Body() updateDidDto: UpdateDidDto) {
    const response = await this.universalRegistrarService.update(updateDidDto);

    return response;
  }

  @Post('deactivate')
  @HttpCode(HttpStatus.OK)
  async deactivate(@Body() deactivateDidDto: DeactivateDidDto) {
    const response =
      await this.universalRegistrarService.deactivate(deactivateDidDto);

    return response;
  }

  @Get('/methods')
  @Header('Content-Type', 'application/did+json')
  getMethods() {
    return this.universalRegistrarService.getMethods();
  }

  @Get('/properties')
  @Header('Content-Type', 'application/did+json')
  getProperties() {
    return this.universalRegistrarService.getProperties();
  }
}
