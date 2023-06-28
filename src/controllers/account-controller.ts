import logger from '@src/logger'
import { RegisterAccountService } from '@src/services/ports/register-account-service'
import { RegisterAccountServiceImpl } from '@src/services/register-account-service-impl'
import { Controller, GET, Inject, POST } from 'fastify-decorators'
import { AccountRequest } from './requests/account-request'
import {
  AbstractDefaultController,
  HttpError,
  Request,
  Response,
} from './default-controller'
import { GetAccountInfoService } from '@src/services/ports/get-account-info-service'
import { GetAccountInfoServiceImpl } from '@src/services/get-account-info-service-impl'
import { authMiddleware } from '@src/middleware/auth'

@Controller('/api/v1/accounts')
class AccountController extends AbstractDefaultController {
  @Inject('RegisterAccountService')
  private readonly registerAccountService: RegisterAccountService

  @Inject('GetAccountInfoService')
  private readonly getAccountInfoService: GetAccountInfoService

  constructor(
    registerAccountService: RegisterAccountServiceImpl,
    getAccountInfoService: GetAccountInfoServiceImpl,
  ) {
    super()
    this.registerAccountService = registerAccountService
    this.getAccountInfoService = getAccountInfoService
  }

  @POST({ url: '/register' })
  public async registerAccount(req: Request, res: Response): Promise<Response> {
    try {
      logger.info('Requesting to register account')
      const account = req.body as AccountRequest
      const result = await this.registerAccountService.execute(account)

      if (result.isError()) {
        logger.error(`Domain Error => ${result.value}`)
        return this.handleError(result.value as HttpError, req, res)
      }

      logger.info('Responding account registered')
      return res.status(202).send({
        status: result.value.status,
        message: `A verification code was sent to the email '${result.value.email}'. Please validate the code to confirm your registration.`,
        url: `${req.protocol}://${req.headers.host}${req.raw.url}/confirm`,
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
  public async getAccountInfo(req: Request, res: Response): Promise<Response> {
    try {
      logger.info('Requesting account info')
      const result = await this.getAccountInfoService.execute(req.user.sub)

      if (result.isError()) {
        logger.error(`Domain Error => ${result.value}`)
        return this.handleError(result.value as HttpError, req, res)
      }

      logger.info('Responding account info')
      return res.status(200).send({
        id: result.value.id,
        name: result.value.name,
        email: result.value.email,
        phone: result.value.phone,
        status: result.value.status,
      })
    } catch (error) {
      logger.error(`Internal Error => ${error}`)
      return this.handleError(error as HttpError, req, res)
    }
  }
}

export { AccountController }
