import { Either } from '@src/shared/either'
import { UserNotFoundError } from '../errors/user-not-found-error'
import { User } from '@src/models/user'

type GetUserInfoResponse = Either<UserNotFoundError, User>

export { GetUserInfoResponse }
