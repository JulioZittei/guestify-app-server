import logger from '@src/logger'
import { FastifyReply, FastifyRequest } from 'fastify'
import { Controller, GET, POST } from 'fastify-decorators'

@Controller('/users')
class UserController {
  @POST({ url: '' })
  public async registerUser(req: FastifyRequest, res: FastifyReply) {
    logger.info('Registering user')
    res.status(201).send('User created')
  }

  @GET({ url: '/me' })
  public async authUser(req: FastifyRequest, res: FastifyReply) {
    logger.info('Returning user info')
    res.status(200).send('User Info')
  }
}

export { UserController }
