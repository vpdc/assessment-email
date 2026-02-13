import { Provider } from '@nestjs/common';
import { generateConnectionOptions } from '@repo/common/generate-connection-options';
import { Client, Connection } from '@temporalio/client';

const options = generateConnectionOptions();

export const TEMPORAL_CLIENT = 'TEMPORAL_CLIENT';

export const temporalClientProvider: Provider = {
  provide: TEMPORAL_CLIENT,
  useFactory: async () => {
    const connection = await Connection.connect(options);
    return new Client({
      connection,
      namespace: process.env.TEMPORAL_NAMESPACE,
    });
  },
};
