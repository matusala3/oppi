import 'reflect-metadata'
import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(__dirname, '../../../.env') })
import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import helmet from '@fastify/helmet'
import { AppModule } from './app.module'
import { env } from './config/env'
import { GlobalExceptionFilter } from './common/filters/http-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  )

  await app.register(helmet)
  app.useGlobalFilters(new GlobalExceptionFilter())

  app.enableCors({
    origin: env.CORS_ORIGIN.split(','),
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })

  await app.listen(env.PORT, '0.0.0.0')
  console.log(`Auth service running on port ${env.PORT}`)
}

void bootstrap()
