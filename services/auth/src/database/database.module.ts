import { Module, Global } from '@nestjs/common'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { env } from '../config/env'
import * as schema from './schema'

export const DATABASE = Symbol('DATABASE')
export type Database = ReturnType<typeof drizzle<typeof schema>>

@Global()
@Module({
  providers: [
    {
      provide: DATABASE,
      useFactory: () => {
        const client = postgres(env.DATABASE_URL)
        return drizzle(client, { schema })
      },
    },
  ],
  exports: [DATABASE],
})
export class DatabaseModule {}
