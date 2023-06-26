import { Request } from '@src/controllers/default-controller'
import logger from '@src/logger'

const authMiddleware = async (req: Request) => {
  logger.info(`Verifying access-token`)
  await req.jwtVerify()
}

export { authMiddleware }
