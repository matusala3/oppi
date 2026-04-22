import type { Config } from 'jest'

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        // ts-jest needs these enabled to handle NestJS decorators
        emitDecoratorMetadata: true,
        experimentalDecorators: true,
      },
    }],
  },
  testEnvironment: 'node',
}

export default config
