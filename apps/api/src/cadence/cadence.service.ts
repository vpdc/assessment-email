import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cadence } from '@repo/common';
import { TemporalService } from '../temporal/temporal.service';

@Injectable()
export class CadenceService {
  private readonly store = new Map<string, Cadence>();

  constructor(private readonly temporalService: TemporalService) {}

  create(cadence: Cadence) {
    if (this.store.get(cadence.id)) {
      throw new ConflictException(`Cadence (id: ${cadence.id}) already exists`);
    }
    this.store.set(cadence.id, cadence);
    return cadence;
  }

  get(id: string) {
    const cadence = this.store.get(id);
    if (!cadence) throw new NotFoundException('Cadence not found');
    return cadence;
  }

  update(id: string, cadence: Cadence) {
    if (!this.store.has(id)) {
      throw new NotFoundException('Cadence not found');
    }
    this.store.set(id, cadence);
    return cadence;
  }
}
