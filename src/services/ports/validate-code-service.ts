import { ValidateCodeRequest } from '@src/controllers/requests/validate-code-request'
import { ValidateCodeResponse } from '../responses/validate-code-response'

interface ValidateCodeService {
  execute({ email, code }: ValidateCodeRequest): Promise<ValidateCodeResponse>
}

export { ValidateCodeService }
