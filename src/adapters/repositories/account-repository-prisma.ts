import { Account } from '@src/models/account'
import { FilterOptions } from '@src/repositories/ports/default-repository'
import { AccountRepository } from '@src/repositories/ports/account-repository'
import { Repository } from '@src/shared/decorators/repository.decorator'
import clientPrisma from './client'
import logger from '@src/logger'

@Repository('AccountRepositoryPrisma')
class AccountRepositoryPrisma implements AccountRepository {
  constructor(private database = clientPrisma) {}

  public async create(account: Account): Promise<Account> {
    logger.info(`Saving account ${account.email}`)
    return await this.database.account.create({
      data: account,
    })
  }

  public async exists(filter: FilterOptions): Promise<boolean> {
    logger.info(`Finding account`)
    const account = await this.database.account.findUnique({
      where: filter,
      select: {
        id: true,
      },
    })

    return account ? true : false
  }

  public async findOne(
    filter: FilterOptions,
  ): Promise<Account | null | undefined> {
    logger.info(`Finding account`)
    return await this.database.account.findUnique({
      where: filter,
    })
  }
  public async findAll(filter: FilterOptions): Promise<Account[]> {
    logger.info(`Finding accounts`)
    return await this.database.account.findMany({
      where: filter,
    })
  }

  public async deleteAll(): Promise<void> {
    logger.info(`Deleting all accounts`)
    await this.database.account.deleteMany()
  }
}

export { AccountRepositoryPrisma }
