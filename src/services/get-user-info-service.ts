import { Inject, Service } from 'fastify-decorators'
import { IGetUserInfoService } from './ports/get-user-info-service'
import { GetUserInfoResponse } from './responses/get-user-info-response'
import { IUserRepository } from '@src/repositories/ports/user-repository'
import { UserRepositoryPrisma } from '@src/adapters/repositories/user-repository'
import { error, result } from '@src/shared/either'
import { UserNotFoundError } from './errors/user-not-found-error'

@Service('GetUserInfoService')
class GetUserInfoService implements IGetUserInfoService {
  @Inject('UserRepositoryPrisma')
  private readonly userRepository: IUserRepository

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

export { GetUserInfoService }
