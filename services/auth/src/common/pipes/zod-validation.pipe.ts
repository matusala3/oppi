import { PipeTransform, ArgumentMetadata, UnprocessableEntityException } from '@nestjs/common'
import { ZodSchema } from 'zod'

export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown, _metadata: ArgumentMetadata): unknown {
    const result = this.schema.safeParse(value)
    if (!result.success) {
      throw new UnprocessableEntityException({
        message: 'Validation failed',
        errors: result.error.flatten().fieldErrors,
      })
    }
    return result.data
  }
}
