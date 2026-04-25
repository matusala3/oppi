import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis'
import Redis from 'ioredis'
import { DatabaseModule } from './database/database.module'
import { AuthModule } from './auth/auth.module'
import { HealthController } from './health/health.controller'
import { env } from './config/env'

const throttlerStorage =
  env.NODE_ENV === 'production'
    ? { storage: new ThrottlerStorageRedisService(new Redis(env.REDIS_URL)) }
    : {}

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'default',
          ttl: 60000,
          limit: 10_000_000,
        },
      ],
      ...throttlerStorage,
    }),
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
