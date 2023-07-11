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
import { ResendCodeRequest } from './requests/resend-code-request'
import { ResendCodeService } from '@src/services/ports/resend-code-service'
import { ResendCodeServiceImpl } from '@src/services/resend-code-service-impl'
import { ValidateCodeRequest } from './requests/validate-code-request'
import { ValidateCodeServiceImpl } from '@src/services/validate-code-service-impl'
import { ValidateCodeService } from '@src/services/ports/validate-code-service'

@Controller('/api/v1/accounts')
class AccountController extends AbstractDefaultController {
  @Inject('RegisterAccountService')
  private readonly registerAccountService: RegisterAccountService

  @Inject('GetAccountInfoService')
  private readonly getAccountInfoService: GetAccountInfoService

  @Inject('ResendCodeServiceImpl')
  private readonly resendCodeService: ResendCodeService

  @Inject('ValidateCodeServiceImpl')
  private readonly validateCodeService: ValidateCodeService

  constructor(
    registerAccountService: RegisterAccountServiceImpl,
    getAccountInfoService: GetAccountInfoServiceImpl,
    resendCodeService: ResendCodeServiceImpl,
    validateCodeService: ValidateCodeServiceImpl,
  ) {
    super()
    this.registerAccountService = registerAccountService
    this.getAccountInfoService = getAccountInfoService
    this.resendCodeService = resendCodeService
    this.validateCodeService = validateCodeService
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

      logger.info('Responding register account')
      return res.status(202).send({
        status: result.value.status,
        message: `A verification code was sent to the email '${result.value.email}'. Please, validate the code to confirm your registration.`,
      })
    } catch (error) {
      logger.error(`Internal Error => ${error}`)
      return this.handleError(error as HttpError, req, res)
    }
  }

  @POST('/register/resend/code')
  public async resendCode(req: Request, res: Response): Promise<Response> {
    try {
      logger.info('Requesting to resend validation code')
      const { email } = req.body as ResendCodeRequest
      const result = await this.resendCodeService.execute({ email })

      if (result.isResult()) {
        logger.info('Responding to resend validation code')
        return res.status(204).send()
      }

      logger.error(`Domain Error => ${result.value}`)
      return this.handleError(result.value as HttpError, req, res)
    } catch (error) {
      logger.error(`Internal Error => ${error}`)
      return this.handleError(error as HttpError, req, res)
    }
  }

  @POST('/register/validate/code')
  public async validateCode(req: Request, res: Response): Promise<Response> {
    try {
      logger.info('Requesting to validate code')
      const { email, code } = req.body as ValidateCodeRequest
      const result = await this.validateCodeService.execute({ email, code })

      if (result.isResult()) {
        logger.info('Responding validation code')
        return res.status(204).send()
      }

      logger.error(`Domain Error => ${result.value}`)
      return this.handleError(result.value as HttpError, req, res)
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
