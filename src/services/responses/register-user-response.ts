import { Either } from '@src/shared/either'
import { User } from '@src/models/user'
import { UserAlreadyExistsError } from '../errors/user-already-exists-error'

type RegisterUserResponse = Either<UserAlreadyExistsError, User>

export { RegisterUserResponse }
