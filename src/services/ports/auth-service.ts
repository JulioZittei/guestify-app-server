import { AuthUserResponse } from '../responses/auth-user-response'

interface AuthService {
  execute({
    email,
    password,
  }: {
    email: string
    password: string
  }): Promise<AuthUserResponse>
}

export { AuthService }
