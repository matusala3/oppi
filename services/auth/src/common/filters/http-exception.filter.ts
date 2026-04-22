import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common'

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const reply = ctx.getResponse<{ status: (code: number) => { send: (body: unknown) => void } }>()

    if (exception instanceof HttpException) {
      const status = exception.getStatus()
      const response = exception.getResponse()
      reply.status(status).send(response)
      return
    }

    // Unexpected error — log internally, never expose details to client
    console.error('Unhandled exception:', exception)
    reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
      statusCode: 500,
      message: 'Internal server error',
    })
  }
}
