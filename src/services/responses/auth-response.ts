import { Either } from '@src/shared/either'
import { UnauthorizedError } from '../errors/unauthorized-error'

type TokenResponse = {
  token: string
}

type AuthAccountResponse = Either<UnauthorizedError, TokenResponse>

export { AuthAccountResponse, TokenResponse }
