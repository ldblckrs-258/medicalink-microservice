import { ThrottlerOptions } from '@nestjs/throttler';

export const throttlerOptions: ThrottlerOptions[] = [
  {
    ttl: 1000,
    limit: 10,
  },
  {
    ttl: 60000,
    limit: 100,
  },
];
