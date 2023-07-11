import { Either } from '@src/shared/either'
import { AccountNotFoundError } from '../errors/account-not-found-error'
import { StepDoneError } from '../errors/step-done-error'

type ResendCodeResponse = Either<AccountNotFoundError | StepDoneError, boolean>

export { ResendCodeResponse }
