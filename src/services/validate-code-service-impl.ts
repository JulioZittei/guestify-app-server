import { ValidateCodeRequest } from '@src/controllers/requests/validate-code-request'
import { ValidateCodeService } from './ports/validate-code-service'
import { ValidateCodeResponse } from './responses/validate-code-response'
import { Inject, Service } from 'fastify-decorators'
import { AccountRepositoryPrisma } from '@src/adapters/repositories/account-repository-prisma'
import { AccountRepository } from '@src/repositories/ports/account-repository'
import CacheNode from '@src/adapters/cache/node-cache'
import logger from '@src/logger'
import { Account, AccountStatus } from '@src/models/account'
import { not, notEquals } from '@src/utils/util'
import { error, result } from '@src/shared/either'
import { AccountNotFoundError } from './errors/account-not-found-error'
import { StepDoneError } from './errors/step-done-error'
import { ExpiredCodeError } from './errors/expired-code-error'
import { InvalidCodeError } from './errors/invalid-code-error'

@Service('ValidateCodeServiceImpl')
class ValidateCodeServiceImpl implements ValidateCodeService {
  @Inject('AccountRepositoryPrisma')
  private readonly accountRepository: AccountRepository

  constructor(
    accountRepository: AccountRepositoryPrisma,
    private readonly cacheService = CacheNode,
  ) {
    this.accountRepository = accountRepository
  }

  async execute({
    email,
    code,
  }: ValidateCodeRequest): Promise<ValidateCodeResponse> {
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

    if (not(codeExists)) {
      logger.error(`Code expired '${code}'`)
      return error(new ExpiredCodeError())
    }

    if (notEquals(codeExists, code)) {
      logger.error(`Code '${code}' invalid`)
      return error(new InvalidCodeError(code))
    }

    logger.info(`Updating account status for '${email}'`)
    this.accountRepository.update({
      ...accountExists,
      status: AccountStatus.EMAIL_VALIDATED,
    } as Account)
    return result(true)
  }
}

export { ValidateCodeServiceImpl }
