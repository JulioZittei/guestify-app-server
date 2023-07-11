import { ResendCodeRequest } from '@src/controllers/requests/resend-code-request'
import { ResendCodeResponse } from '../responses/resend-code-response'

interface ResendCodeService {
  execute({ email }: ResendCodeRequest): Promise<ResendCodeResponse>
}

export { ResendCodeService }
