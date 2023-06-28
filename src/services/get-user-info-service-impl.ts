import { Inject, Service } from 'fastify-decorators'
import { GetUserInfoService } from './ports/get-user-info-service'
import { GetUserInfoResponse } from './responses/get-user-info-response'
import { UserRepository } from '@src/repositories/ports/user-repository'
import { UserRepositoryPrisma } from '@src/adapters/repositories/user-repository-prisma'
import { error, result } from '@src/shared/either'
import { UserNotFoundError } from './errors/user-not-found-error'

@Service('GetUserInfoService')
class GetUserInfoServiceImpl implements GetUserInfoService {
  @Inject('UserRepositoryPrisma')
  private readonly userRepository: UserRepository

  constructor(userRepository: UserRepositoryPrisma) {
    this.userRepository = userRepository
  }

  async execute(userId: string): Promise<GetUserInfoResponse> {
    const user = await this.userRepository.findOne({ id: userId })

    if (!user) {
      return error(new UserNotFoundError(userId))
    }

    return result(user)
  }
}

export { GetUserInfoServiceImpl }
