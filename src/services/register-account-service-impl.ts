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

@Service('RegisterAccountService')
class RegisterAccountServiceImpl implements RegisterAccountService {
  @Inject('AccountRepositoryPrisma')
  private readonly accountRepository: AccountRepository

  constructor(
    accountRepository: AccountRepositoryPrisma,
    private cache = CacheNode,
  ) {
    this.accountRepository = accountRepository
  }

  public async execute(
    account: AccountRequest,
  ): Promise<RegisterAccountResponse> {
    logger.info(`Verifying if account '${account.email}' exists`)
    const exists = await this.accountRepository.exists({ email: account.email })

    if (exists) {
      logger.error(`Account '${account.email}' already exists`)
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

    logger.info(`Generating a verification code`)
    const randomCode =
      Math.floor(Math.random() * (999_999 - 100_000 + 1)) + 100_000

    logger.info(`Verification code: '${randomCode}'`)
    this.cache.set(accountCreated.id as string, randomCode)

    logger.info(`Sending code to the email '${accountCreated.email}'`)
    // TODO: Email service

    logger.info(`Account '${account.email}' registered successfully`)
    return result(accountCreated)
  }
}

export { RegisterAccountServiceImpl }
