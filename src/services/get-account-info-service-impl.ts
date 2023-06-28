import { Inject, Service } from 'fastify-decorators'
import { GetAccountInfoService } from './ports/get-account-info-service'
import { GetAccountInfoResponse } from './responses/get-account-info-response'
import { AccountRepository } from '@src/repositories/ports/account-repository'
import { AccountRepositoryPrisma } from '@src/adapters/repositories/account-repository-prisma'
import { error, result } from '@src/shared/either'
import { AccountNotFoundError } from './errors/account-not-found-error'

@Service('GetAccountInfoService')
class GetAccountInfoServiceImpl implements GetAccountInfoService {
  @Inject('AccountRepositoryPrisma')
  private readonly accountRepository: AccountRepository

  constructor(accountRepository: AccountRepositoryPrisma) {
    this.accountRepository = accountRepository
  }

  async execute(accountId: string): Promise<GetAccountInfoResponse> {
    const account = await this.accountRepository.findOne({ id: accountId })

    if (!account) {
      return error(new AccountNotFoundError(accountId))
    }

    return result(account)
  }
}

export { GetAccountInfoServiceImpl }
