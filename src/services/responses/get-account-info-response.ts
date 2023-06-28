import { Either } from '@src/shared/either'
import { AccountNotFoundError } from '../errors/account-not-found-error'
import { Account } from '@src/models/account'

type GetAccountInfoResponse = Either<AccountNotFoundError, Account>

export { GetAccountInfoResponse }
