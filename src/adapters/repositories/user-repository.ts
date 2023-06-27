import { User } from '@src/models/user'
import { FilterOptions } from '@src/repositories/ports/default-repository'
import { IUserRepository } from '@src/repositories/ports/user-repository'
import { Repository } from '@src/shared/decorators/repository.decorator'
import clientPrisma from './client'
import logger from '@src/logger'

@Repository('UserRepositoryPrisma')
class UserRepositoryPrisma implements IUserRepository {
  constructor(private database = clientPrisma) {}

  public async create(user: User): Promise<User> {
    logger.info(`Saving user ${user.email}`)
    return await this.database.user.create({
      data: user,
    })
  }

  public async exists(filter: FilterOptions): Promise<boolean> {
    logger.info(`Finding user`)
    const user = await this.database.user.findUnique({
      where: filter,
      select: {
        id: true,
      },
    })

    return user ? true : false
  }

  public async findOne(
    filter: FilterOptions,
  ): Promise<User | null | undefined> {
    logger.info(`Finding user`)
    return await this.database.user.findUnique({
      where: filter,
    })
  }
  public async findAll(filter: FilterOptions): Promise<User[]> {
    logger.info(`Finding users`)
    return await this.database.user.findMany({
      where: filter,
    })
  }

  public async deleteAll(): Promise<void> {
    logger.info(`Deleting all users`)
    await this.database.user.deleteMany()
  }
}

export { UserRepositoryPrisma }
