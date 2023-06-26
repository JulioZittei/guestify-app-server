import { IAuthService } from './ports/auth-service'
import bcrypt from 'bcrypt'
import { AuthUserResponse } from './responses/auth-user-response'
import { Inject, Service } from 'fastify-decorators'
import { IUserRepository } from '@src/repositories/ports/user-repository'
import { UserRepositoryPrisma } from '@src/adapters/repositories/user-repository'
import { UnauthorizedError } from './errors/unauthorized-error'
import { result, error } from '@src/shared/either'
import jwt from 'jsonwebtoken'
import config from 'config'
import logger from '@src/logger'

interface JwtToken {
  sub: string
}

@Service('AuthService')
class AuthService implements IAuthService {
  @Inject('UserRepositoryPrisma')
  private readonly userRepository: IUserRepository

  constructor(userRepository: UserRepositoryPrisma) {
    this.userRepository = userRepository
  }

  async execute({
    email,
    password,
  }: {
    email: string
    password: string
  }): Promise<AuthUserResponse> {
    logger.info(`Authenticating user ${email}`)
    const user = await this.userRepository.findOne({
      email,
    })

    if (!user) {
      logger.error(`User ${email} not found`)
      return error(new UnauthorizedError())
    }

    if (!(await AuthService.comparePasswords(password, user.password))) {
      logger.error(`User password does not match`)
      return error(new UnauthorizedError())
    }

    const token = {
      token: AuthService.generateToken(user.id as string),
    }

    logger.info(`User ${user.email} authenticated successfully`)
    return result(token)
  }

  public static async hashPassword(
    password: string,
    salt = 10,
  ): Promise<string> {
    return await bcrypt.hash(password, salt)
  }

  public static async comparePasswords(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword)
  }

  public static generateToken(sub: string): string {
    return jwt.sign({ sub }, config.get<string>('App.auth.secretKey'), {
      expiresIn: config.get<number>('App.auth.expiresIn'),
    })
  }

  public static decodeToken(token: string): JwtToken {
    return jwt.verify(
      token,
      config.get<string>('App.auth.secretKey'),
    ) as JwtToken
  }
}

export { AuthService, JwtToken }
