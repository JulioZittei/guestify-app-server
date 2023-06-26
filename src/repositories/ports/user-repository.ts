import { DefaultRepository } from './default-repository'
import { User } from '@src/models/user'

type IUserRepository = DefaultRepository<User>

export { IUserRepository }
