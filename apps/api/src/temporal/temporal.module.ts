import { Global, Module } from '@nestjs/common';
import { temporalClientProvider } from './temporal.provider';
import { TemporalService } from './temporal.service';

@Global()
@Module({
  providers: [temporalClientProvider, TemporalService],
  exports: [TemporalService],
})
export class TemporalModule {}
