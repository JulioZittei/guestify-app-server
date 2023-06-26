import { Either } from '@src/shared/either'
import { UnauthorizedError } from '../errors/unauthorized-error'

type TokenResponse = {
  token: string
}

type AuthUserResponse = Either<UnauthorizedError, TokenResponse>

export { AuthUserResponse, TokenResponse }
