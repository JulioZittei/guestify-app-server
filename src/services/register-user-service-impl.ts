import { Inject, Service } from 'fastify-decorators'
import { RegisterUserService } from './ports/register-user-service'
import { RegisterUserResponse } from './responses/register-user-response'
import { User } from '@src/models/user'
import { UserRepositoryPrisma } from '@src/adapters/repositories/user-repository-prisma'
import { UserRepository } from '@src/repositories/ports/user-repository'
import { error, result } from '@src/shared/either'
import logger from '@src/logger'
import { AuthServiceImpl } from './auth-service-impl'
import { UserAlreadyExistsError } from './errors/user-already-exists-error'

@Service('RegisterUserService')
class RegisterUserServiceImpl implements RegisterUserService {
  @Inject('UserRepositoryPrisma')
  private readonly userRepository: UserRepository

  constructor(userRepository: UserRepositoryPrisma) {
    this.userRepository = userRepository
  }

  public async execute(user: User): Promise<RegisterUserResponse> {
    logger.info(`Verifying if user ${user.email} exists`)
    const exists = await this.userRepository.exists({ email: user.email })

    if (exists) {
      logger.error(`User ${user.email} already exists`)
      return error(new UserAlreadyExistsError(user.email))
    }

    logger.info(`Registering user ${user.email}`)
    const hashedPassword = await AuthServiceImpl.hashPassword(user.password)
    const userCreated: User = await this.userRepository.create(
      User.create({
        ...user,
        password: hashedPassword,
      }),
    )
    logger.info(`User ${user.email} registered successfully`)
    return result(userCreated)
  }
}

export { RegisterUserServiceImpl }
