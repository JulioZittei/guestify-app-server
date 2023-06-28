import { GetUserInfoResponse } from '../responses/get-user-info-response'

interface GetUserInfoService {
  execute(userId: string): Promise<GetUserInfoResponse>
}

export { GetUserInfoService }
