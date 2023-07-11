import { Inject, Service } from 'fastify-decorators'
import { GetAccountInfoService } from './ports/get-account-info-service'
import { GetAccountInfoResponse } from './responses/get-account-info-response'
import { AccountRepository } from '@src/repositories/ports/account-repository'
import { AccountRepositoryPrisma } from '@src/adapters/repositories/account-repository-prisma'
import { error, result } from '@src/shared/either'
import { AccountNotFoundError } from './errors/account-not-found-error'
import logger from '@src/logger'
import { not } from '@src/utils/util'
import { Account } from '@src/models/account'

@Service('GetAccountInfoService')
class GetAccountInfoServiceImpl implements GetAccountInfoService {
  @Inject('AccountRepositoryPrisma')
  private readonly accountRepository: AccountRepository

  constructor(accountRepository: AccountRepositoryPrisma) {
    this.accountRepository = accountRepository
  }

  async execute(accountId: string): Promise<GetAccountInfoResponse> {
    logger.info(`Finding account with ${accountId}`)
    const account = await this.accountRepository.findOne({ id: accountId })

    if (not(account)) {
      logger.error(`There is no account with '${accountId}'`)
      return error(new AccountNotFoundError(accountId))
    }

    logger.error(`Account found with '${accountId}'`)
    return result(account as Account)
  }
}

export { GetAccountInfoServiceImpl }
