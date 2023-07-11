import { Either } from '@src/shared/either'
import { AccountNotFoundError } from '../errors/account-not-found-error'
import { StepDoneError } from '../errors/step-done-error'
import { InvalidCodeError } from '../errors/invalid-code-error'
import { ExpiredCodeError } from '../errors/expired-code-error'

type ValidateCodeResponse = Either<
  AccountNotFoundError | StepDoneError | InvalidCodeError | ExpiredCodeError,
  boolean
>

export { ValidateCodeResponse }
