import { FastifyReply, FastifyRequest } from 'fastify'
import HttpStatus from 'http-status-codes'
import { ServerError } from './errors/server-error'

type Request = FastifyRequest
type Response = FastifyReply

interface HttpError extends Error {
  status?: number
  code: number
}

abstract class AbstractDefaultController {
  protected handleError(
    error: HttpError,
    req: FastifyRequest,
    res: FastifyReply,
  ): FastifyReply {
    const statusCode = error.status || error.code || 500
    return res.status(statusCode).send({
      path: req.raw.url,
      code: statusCode,
      error: HttpStatus.getStatusText(statusCode),
      message: statusCode != 500 ? error.message : new ServerError().message,
    })
  }
}

export { AbstractDefaultController, HttpError, Request, Response }
