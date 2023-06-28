import { AuthAccountResponse } from '../responses/auth-account-response'

interface AuthService {
  execute({
    email,
    password,
  }: {
    email: string
    password: string
  }): Promise<AuthAccountResponse>
}

export { AuthService }
