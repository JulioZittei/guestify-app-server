import './config/module-alias'
import fastify, { FastifyInstance } from 'fastify'
import { bootstrap } from 'fastify-decorators'
import logger from './logger'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import config from 'config'
import { AuthController } from './controllers/auth-controller'
import { AccountController } from './controllers/account-controller'

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

  public async start(): Promise<string> {
    logger.info('🕐 Starting up server')
    const httpServer = await this.server.listen({
      port: this.port,
    })
    logger.info(`🚀 HTTP server running on ${this.baseUrl}:${this.port}`)
    return httpServer
  }

  public async close(): Promise<void> {
    logger.info('🕚 Shutting down server')
    await this.server.close()
  }

  private setupFastify(): void {
    logger.info('🔌 Setting up plugins')
    this.server.register(cors, { origin: '*' })
    this.server.register(jwt, {
      secret: config.get('App.auth.secretKey'),
    })
    this.server.decorate('logger', logger)
  }

  private setupControllers(): void {
    logger.info('🎮 Setting up controllers')

    this.server.register(bootstrap, {
      controllers: [AccountController, AuthController],
    })
  }

  private setupErrorHandlers(): void {
    logger.info('❎ Setting up error handlers')
  }
}

export { SetupServer }
