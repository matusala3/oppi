import 'reflect-metadata'
import { Test, TestingModule } from '@nestjs/testing'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerModule, ThrottlerGuard, Throttle, SkipThrottle } from '@nestjs/throttler'
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis'
import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common'
import Redis from 'ioredis'

// Redis DB 1 keeps test data isolated from dev data in DB 0
const REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379/1'

// Mirrors the throttle config in auth.controller.ts — no DB or AuthService needed
@Controller('auth')
class MockAuthController {
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  login() {
    return { ok: true }
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  register() {
    return { ok: true }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @SkipThrottle()
  refresh() {
    return { ok: true }
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @SkipThrottle()
  logout() {
    return {}
  }
}

describe('Rate Limiting (integration)', () => {
  let app: NestFastifyApplication
  let redis: Redis

  beforeAll(async () => {
    redis = new Redis(REDIS_URL)

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MockAuthController],
      imports: [
        ThrottlerModule.forRoot({
          throttlers: [{ name: 'default', ttl: 60000, limit: 10 }],
          storage: new ThrottlerStorageRedisService(redis),
        }),
      ],
      providers: [
        {
          provide: APP_GUARD,
          useClass: ThrottlerGuard,
        },
      ],
    }).compile()

    app = module.createNestApplication<NestFastifyApplication>(new FastifyAdapter())
    await app.init()
    await app.getHttpAdapter().getInstance().ready()
  })

  afterAll(async () => {
    await app.close()
    await redis.quit()
  })

  beforeEach(async () => {
    await redis.flushdb()
  })

  describe('POST /auth/login (limit: 5/min)', () => {
    it('allows up to 5 requests', async () => {
      for (let i = 0; i < 5; i++) {
        const response = await app.inject({ method: 'POST', url: '/auth/login' })
        expect(response.statusCode).toBe(200)
      }
    })

    it('blocks the 6th request with 429', async () => {
      for (let i = 0; i < 5; i++) {
        await app.inject({ method: 'POST', url: '/auth/login' })
      }

      const response = await app.inject({ method: 'POST', url: '/auth/login' })
      expect(response.statusCode).toBe(429)
    })
  })

  describe('POST /auth/register (limit: 10/min)', () => {
    it('allows up to 10 requests', async () => {
      for (let i = 0; i < 10; i++) {
        const response = await app.inject({ method: 'POST', url: '/auth/register' })
        expect(response.statusCode).toBe(201)
      }
    })

    it('blocks the 11th request with 429', async () => {
      for (let i = 0; i < 10; i++) {
        await app.inject({ method: 'POST', url: '/auth/register' })
      }

      const response = await app.inject({ method: 'POST', url: '/auth/register' })
      expect(response.statusCode).toBe(429)
    })
  })

  describe('POST /auth/refresh (@SkipThrottle)', () => {
    it('never returns 429 regardless of request count', async () => {
      for (let i = 0; i < 20; i++) {
        const response = await app.inject({ method: 'POST', url: '/auth/refresh' })
        expect(response.statusCode).not.toBe(429)
      }
    })
  })

  describe('POST /auth/logout (@SkipThrottle)', () => {
    it('never returns 429 regardless of request count', async () => {
      for (let i = 0; i < 20; i++) {
        const response = await app.inject({ method: 'POST', url: '/auth/logout' })
        expect(response.statusCode).not.toBe(429)
      }
    })
  })
})
