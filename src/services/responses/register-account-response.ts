import { Either } from '@src/shared/either'
import { Account } from '@src/models/account'
import { AccountAlreadyExistsError } from '../errors/account-already-exists-error'

type RegisterAccountResponse = Either<AccountAlreadyExistsError, Account>

export { RegisterAccountResponse }
