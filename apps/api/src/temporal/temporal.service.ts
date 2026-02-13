import { Inject, Injectable } from '@nestjs/common';
import { Client } from '@temporalio/client';
import { TEMPORAL_CLIENT } from './temporal.provider';

@Injectable()
export class TemporalService {
  constructor(@Inject(TEMPORAL_CLIENT) private readonly client: Client) {}

  get clientInstance(): Client {
    return this.client;
  }
}
