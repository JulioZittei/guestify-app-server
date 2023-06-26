import { User } from '@src/models/user'
import { RegisterUserResponse } from '../responses/register-user-response'

interface IRegisterUserService {
  execute(user: User): Promise<RegisterUserResponse>
}

export { IRegisterUserService }
