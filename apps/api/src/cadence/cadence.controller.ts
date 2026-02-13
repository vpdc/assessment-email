import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { CadenceService } from './cadence.service';
import { CadenceSchema, type Cadence } from '@repo/common';
import { ZodValidationPipe } from '../common/zod-validation.pipe';

@Controller('cadences')
export class CadenceController {
  constructor(private readonly cadenceService: CadenceService) {}

  @Post()
  create(
    @Body(new ZodValidationPipe(CadenceSchema))
    body: Cadence,
  ) {
    return this.cadenceService.create(body);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.cadenceService.get(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(CadenceSchema))
    body: Cadence,
  ) {
    return this.cadenceService.update(id, body);
  }
}
