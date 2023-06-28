import { DefaultRepository } from './default-repository'
import { User } from '@src/models/user'

type UserRepository = DefaultRepository<User>

export { UserRepository }
