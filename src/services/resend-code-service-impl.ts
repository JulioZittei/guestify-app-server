import { Inject, Service } from 'fastify-decorators'
import { ResendCodeService } from './ports/resend-code-service'
import { ResendCodeRequest } from '@src/controllers/requests/resend-code-request'
import { ResendCodeResponse } from './responses/resend-code-response'
import CacheNode from '@src/adapters/cache/node-cache'
import { AccountRepository } from '@src/repositories/ports/account-repository'
import { AccountRepositoryPrisma } from '@src/adapters/repositories/account-repository-prisma'
import logger from '@src/logger'
import { not, notEquals } from '@src/utils/util'
import { AccountNotFoundError } from './errors/account-not-found-error'
import { error, result } from '@src/shared/either'
import { AccountStatus } from '@src/models/account'
import { StepDoneError } from './errors/step-done-error'
import { MathUtil } from '@src/utils/math-util'
import { MailService } from './ports/mail-service'
import { MailServiceNodeMailer } from '@src/adapters/mail/mail-service-nodemailer'
import config from 'config'
import { TemplateEmailResolver } from '@src/utils/template-email-resolver'

@Service('ResendCodeServiceImpl')
class ResendCodeServiceImpl implements ResendCodeService {
  @Inject('AccountRepositoryPrisma')
  private readonly accountRepository: AccountRepository
  @Inject('MailServiceNodeMailer')
  private readonly mailService: MailService

  constructor(
    accountRepository: AccountRepositoryPrisma,
    mailService: MailServiceNodeMailer,
    private readonly cacheService = CacheNode,
  ) {
    this.accountRepository = accountRepository
    this.mailService = mailService
  }

  async execute({ email }: ResendCodeRequest): Promise<ResendCodeResponse> {
    logger.info(`Verifying if account exists with '${email}'`)
    const accountExists = await this.accountRepository.findOne({
      email,
    })

    if (not(accountExists)) {
      logger.error(`There is no account with '${email}'`)
      return error(new AccountNotFoundError(email))
    }

    if (notEquals(accountExists?.status, AccountStatus.AWAITING_VALIDATION)) {
      logger.error(`Step done`)
      return error(new StepDoneError())
    }

    logger.info(`Getting code from cache for '${email}'`)
    const codeExists = this.cacheService.get(email)

    let codeToSend: string

    if (not(codeExists)) {
      logger.info(`Sending a new validation code to email '${email}'`)
      codeToSend = MathUtil.generateRandomCode(6)

      logger.info(`Setting code in cache to '${email}'`)
      this.cacheService.set(email as string, codeToSend)
    } else {
      logger.info(`Sending cached validation code to email '${email}'`)
      codeToSend = codeExists as string
    }

    await this.mailService.send({
      from: config.get('App.mail.from'),
      to: email,
      subject: 'Confirmação de Cadastro',
      html: TemplateEmailResolver.resolve('email_validation_template.html', {
        name: accountExists?.name as string,
        email: email,
        code: codeToSend as string,
      }),
    })

    return result(true)
  }
}

export { ResendCodeServiceImpl }
