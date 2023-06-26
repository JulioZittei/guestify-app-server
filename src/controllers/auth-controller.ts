import { Controller, Inject, POST } from 'fastify-decorators'
import {
  AbstractDefaultController,
  HttpError,
  Request,
  Response,
} from './default-controller'
import { IAuthService } from '@src/services/ports/auth-service'
import { AuthService } from '@src/services/auth-service'
import { AuthRequest } from './requests/auth-request'
import logger from '@src/logger'

@Controller('/api/v1')
class AuthController extends AbstractDefaultController {
  @Inject('AuthService')
  private readonly authService: IAuthService

  constructor(authService: AuthService) {
    super()
    this.authService = authService
  }

  @POST('/auth')
  public async auth(req: Request, res: Response): Promise<Response> {
    try {
      logger.info('Requesting to authenticate user')
      const { email, password } = req.body as AuthRequest
      const result = await this.authService.execute({ email, password })

      if (result.isError()) {
        logger.error(`Domain Error => ${result.value}`)
        return this.handleError(result.value as HttpError, req, res)
      }

      logger.info('Responding user authenticated')
      return res.status(200).send(result.value)
    } catch (error) {
      logger.error(`Internal Error => ${error}`)
      return this.handleError(error as HttpError, req, res)
    }
  }
}

export { AuthController }
