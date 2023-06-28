import { GetAccountInfoResponse } from '../responses/get-account-info-response'

interface GetAccountInfoService {
  execute(accountId: string): Promise<GetAccountInfoResponse>
}

export { GetAccountInfoService }
