import { User } from '@src/models/user'
import { RegisterUserResponse } from '../responses/register-user-response'

interface RegisterUserService {
  execute(user: User): Promise<RegisterUserResponse>
}

export { RegisterUserService }
