import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis'
import Redis from 'ioredis'
import { DatabaseModule } from './database/database.module'
import { AuthModule } from './auth/auth.module'
import { HealthController } from './health/health.controller'
import { env } from './config/env'

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'default',
          ttl: 60000, // 1 minute window
          limit: 10,  // default: 10 requests per minute
        },
      ],
      storage: new ThrottlerStorageRedisService(new Redis(env.REDIS_URL)),
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
