import { Either } from '@src/shared/either'
import { UnauthorizedError } from '../errors/unauthorized-error'
import { EmailConfirmationPendingError } from '../errors/email-confirmation-pending-error'

type TokenResponse = {
  token: string
}

type AuthAccountResponse = Either<
  UnauthorizedError | EmailConfirmationPendingError,
  TokenResponse
>

export { AuthAccountResponse, TokenResponse }
