import { AuthService } from './ports/auth-service'
import bcrypt from 'bcrypt'
import { AuthAccountResponse } from './responses/auth-response'
import { Inject, Service } from 'fastify-decorators'
import { AccountRepository } from '@src/repositories/ports/account-repository'
import { AccountRepositoryPrisma } from '@src/adapters/repositories/account-repository-prisma'
import { UnauthorizedError } from './errors/unauthorized-error'
import { result, error } from '@src/shared/either'
import jwt from 'jsonwebtoken'
import config from 'config'
import logger from '@src/logger'
import { equals, not } from '@src/utils/util'
import { AccountStatus } from '@src/models/account'
import { EmailConfirmationPendingError } from './errors/email-confirmation-pending-error'

interface JwtToken {
  sub: string
}

@Service('AuthService')
class AuthServiceImpl implements AuthService {
  @Inject('AccountRepositoryPrisma')
  private readonly accountRepository: AccountRepository

  constructor(accountRepository: AccountRepositoryPrisma) {
    this.accountRepository = accountRepository
  }

  async execute({
    email,
    password,
  }: {
    email: string
    password: string
  }): Promise<AuthAccountResponse> {
    logger.info(`Authenticating accountExists '${email}'`)
    const accountExists = await this.accountRepository.findOne({
      email,
    })

    if (not(accountExists)) {
      logger.error(`There is no account with '${email}'`)
      return error(new UnauthorizedError())
    }

    if (
      !(await AuthServiceImpl.comparePasswords(
        password,
        accountExists?.password as string,
      ))
    ) {
      logger.error(`Account password does not match`)
      return error(new UnauthorizedError())
    }

    if (equals(accountExists?.status, AccountStatus.AWAITING_VALIDATION)) {
      logger.error(`Email confirmation pending`)
      return error(new EmailConfirmationPendingError())
    }

    const token = {
      token: AuthServiceImpl.generateToken(accountExists?.id as string),
    }

    logger.info(`Account '${accountExists?.email}' authenticated successfully`)
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

export { AuthServiceImpl, JwtToken }
