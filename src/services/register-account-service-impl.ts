import { Inject, Service } from 'fastify-decorators'
import { RegisterAccountService } from './ports/register-account-service'
import { RegisterAccountResponse } from './responses/register-account-response'
import { AccountStatus, Account } from '@src/models/account'
import { AccountRepositoryPrisma } from '@src/adapters/repositories/account-repository-prisma'
import { AccountRequest } from '@src/controllers/requests/account-request'
import { AccountRepository } from '@src/repositories/ports/account-repository'
import { error, result } from '@src/shared/either'
import logger from '@src/logger'
import { AuthServiceImpl } from './auth-service-impl'
import { AccountAlreadyExistsError } from './errors/account-already-exists-error'
import CacheNode from '@src/adapters/cache/node-cache'
import { MailService } from './ports/mail-service'
import { MailServiceNodeMailer } from '@src/adapters/mail/mail-service-nodemailer'
import config from 'config'
import { MathUtil } from '@src/utils/math-util'
import { TemplateEmailResolver } from '@src/utils/template-email-resolver'

@Service('RegisterAccountService')
class RegisterAccountServiceImpl implements RegisterAccountService {
  @Inject('AccountRepositoryPrisma')
  private readonly accountRepository: AccountRepository

  @Inject('MailServiceNodeMailer')
  private readonly mailService: MailService

  constructor(
    accountRepository: AccountRepositoryPrisma,
    mailService: MailServiceNodeMailer,
    private cacheService = CacheNode,
  ) {
    this.accountRepository = accountRepository
    this.mailService = mailService
  }

  public async execute(
    account: AccountRequest,
  ): Promise<RegisterAccountResponse> {
    logger.info(`Verifying if account '${account.email}' exists`)
    const exists = await this.accountRepository.exists({ email: account.email })

    if (exists) {
      logger.error(`Already exists an account with email '${account.email}'`)
      return error(new AccountAlreadyExistsError(account.email))
    }

    logger.info(`Registering account '${account.email}'`)
    const hashedPassword = await AuthServiceImpl.hashPassword(account.password)
    const accountCreated: Account = await this.accountRepository.create(
      Account.create({
        ...account,
        password: hashedPassword,
        status: AccountStatus.AWAITING_VALIDATION,
      }),
    )

    logger.info(`Generating a verification code to '${accountCreated.email}'`)
    const randomCode = MathUtil.generateRandomCode(6)

    logger.info(`Setting code in cache to '${accountCreated.email}'`)
    this.cacheService.set(
      accountCreated.email as string,
      randomCode,
      config.get('App.cache.ttl'),
    )

    logger.info(`Sending validation code to email '${accountCreated.email}'`)
    this.mailService.send({
      from: config.get('App.mail.from'),
      to: accountCreated.email,
      subject: 'Confirmação de Cadastro',
      html: TemplateEmailResolver.resolve('email_validation_template.html', {
        name: accountCreated.name,
        email: account.email,
        code: randomCode,
      }),
    })

    logger.info(`Account pre-registered with success`)
    return result(accountCreated)
  }
}

export { RegisterAccountServiceImpl }
