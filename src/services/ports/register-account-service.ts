import { RegisterAccountResponse } from '../responses/register-account-response'
import { AccountRequest } from '@src/controllers/requests/account-request'

interface RegisterAccountService {
  execute(account: AccountRequest): Promise<RegisterAccountResponse>
}

export { RegisterAccountService }
