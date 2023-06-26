import { Either } from '@src/shared/either'
import { User } from '@src/models/user'

type RegisterUserResponse = Either<Error, User>

export { RegisterUserResponse }
