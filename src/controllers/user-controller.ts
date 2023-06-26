import logger from '@src/logger'
import { IRegisterUserService } from '@src/services/ports/register-user-service'
import { RegisterUserService } from '@src/services/register-user-service'
import { Controller, GET, Inject, POST } from 'fastify-decorators'
import { UserRequest } from './requests/user-request'
import {
  AbstractDefaultController,
  HttpError,
  Request,
  Response,
} from './default-controller'
import { IGetUserInfoService } from '@src/services/ports/get-user-info-service'
import { GetUserInfoService } from '@src/services/get-user-info-service'
import { authMiddleware } from '@src/middleware/auth'

@Controller('/api/v1/users')
class UserController extends AbstractDefaultController {
  @Inject('RegisterUserService')
  private readonly registerUserService: IRegisterUserService

  @Inject('GetUserInfoService')
  private readonly getUserInfoService: IGetUserInfoService

  constructor(
    registerUserService: RegisterUserService,
    getUserInfoService: GetUserInfoService,
  ) {
    super()
    this.registerUserService = registerUserService
    this.getUserInfoService = getUserInfoService
  }

  @POST({ url: '' })
  public async registerUser(req: Request, res: Response): Promise<Response> {
    try {
      logger.info('Requesting to register user')
      const user = req.body as UserRequest
      const result = await this.registerUserService.execute(user)

      if (result.isError()) {
        logger.error(`Domain Error => ${result.value}`)
        return this.handleError(result.value as HttpError, req, res)
      }

      logger.info('Responding user registered')
      return res.status(201).send({
        id: result.value.id,
        name: result.value.name,
        email: result.value.email,
        phone: result.value.phone,
      })
    } catch (error) {
      logger.error(`Internal Error => ${error}`)
      return this.handleError(error as HttpError, req, res)
    }
  }

  @GET({
    url: '/me',
    options: {
      preHandler: authMiddleware,
    },
  })
  public async getUserInfo(req: Request, res: Response): Promise<Response> {
    try {
      logger.info('Requesting user info')
      const result = await this.getUserInfoService.execute(req.user.sub)

      if (result.isError()) {
        logger.error(`Domain Error => ${result.value}`)
        return this.handleError(result.value as HttpError, req, res)
      }

      logger.info('Responding user info')
      return res.status(200).send({
        id: result.value.id,
        name: result.value.name,
        email: result.value.email,
        phone: result.value.phone,
      })
    } catch (error) {
      logger.error(`Internal Error => ${error}`)
      return this.handleError(error as HttpError, req, res)
    }
  }
}

export { UserController }
