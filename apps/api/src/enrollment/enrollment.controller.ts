import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import {
  CreateEnrollmentSchema,
  UpdateCadenceSchema,
  type CreateEnrollmentDto,
  type UpdateCadenceDto,
} from '@repo/common';

@Controller('enrollments')
export class EnrollmentController {
  constructor(private readonly service: EnrollmentService) {}

  @Post()
  create(
    @Body(new ZodValidationPipe(CreateEnrollmentSchema))
    body: CreateEnrollmentDto,
  ) {
    return this.service.create(body);
  }

  @Get(':id')
  getState(@Param('id') id: string) {
    return this.service.getState(id);
  }

  @Post(':id/update-cadence')
  updateCadence(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateCadenceSchema))
    body: UpdateCadenceDto,
  ) {
    return this.service.updateCadence(id, body.steps);
  }
}
