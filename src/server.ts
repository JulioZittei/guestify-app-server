import './util/module-alias'
import fastify, { FastifyInstance } from 'fastify'
import { bootstrap } from 'fastify-decorators'
import cors from '@fastify/cors'
import { UserController } from './controllers/user.controller'
import logger from './logger'

class SetupServer {
  private server: FastifyInstance

  constructor(
    private port: number = 3000,
    private baseUrl: string = 'http://localhost',
  ) {
    this.server = fastify()
  }

  public async init(): Promise<void> {
    logger.info('🛠️ Initializing server setup')
    this.setupFastify()
    this.setupControllers()
    this.setupErrorHandlers()
  }

  public start(): void {
    logger.info('🕐 Starting up server')
    this.server
      .listen({
        port: this.port,
      })
      .then(() => {
        logger.info(`🚀 HTTP server running on ${this.baseUrl}:${this.port}`)
      })
  }

  public async close(): Promise<void> {
    logger.info('🕚 Shutting down server')
    await this.server.close()
  }

  private setupFastify(): void {
    logger.info('🔌 Setting up plugins')
    this.server.register(cors, { origin: '*' })
    this.server.decorate('logger', logger)
  }

  private setupControllers(): void {
    logger.info('🎮 Setting up controllers')

    this.server.register(bootstrap, {
      controllers: [UserController],
    })
  }

  private setupErrorHandlers(): void {
    logger.info('❎ Setting up error handlers')
  }
}

export { SetupServer }
