import { GetUserInfoResponse } from '../responses/get-user-info-response'

interface IGetUserInfoService {
  execute(userId: string): Promise<GetUserInfoResponse>
}

export { IGetUserInfoService }
