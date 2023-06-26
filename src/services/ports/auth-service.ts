import { AuthUserResponse } from '../responses/auth-user-response'

interface IAuthService {
  execute({
    email,
    password,
  }: {
    email: string
    password: string
  }): Promise<AuthUserResponse>
}

export { IAuthService }
