import { UserRepositoryPrisma } from '@src/adapters/repositories/user-repository-prisma'
import { AuthServiceImpl } from '@src/services/auth-service-impl'
import { Request, Response } from '@src/controllers/default-controller'
import { TokenResponse } from '@src/services/responses/auth-user-response'
import { error, result } from '@src/shared/either'
import { AuthController } from '@src/controllers/auth-controller'
import { IncomingMessage } from 'http'
import { UnauthorizedError } from '@src/services/errors/unauthorized-error'
import HttpStatus from 'http-status-codes'
import { ServerError } from '@src/controllers/errors/server-error'

jest.mock('@src/services/auth-service-impl')
jest.mock('@src/adapters/repositories/user-repository-prisma')

describe('Auth Controller', () => {
  const userData = {
    email: 'john@mail.com',
    password: '12345',
  }

  const generatedToken: TokenResponse = {
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMTBiM2M5NC1lMjhmLTQ1YjgtOTBhOS01NzdhNzJjNDQxNDMiLCJpYXQiOjE2ODc4MTA1OTYsImV4cCI6MTY4NzgxMDY1Nn0.0oJhFtihgzcqbr-7JAVkdi1by3yCQnCnitTqnrAveng',
  }

  const raw: Partial<IncomingMessage> = {
    url: '/api/v1/auth',
  }

  const req: Partial<Request> = {
    raw: raw as IncomingMessage,
    body: {
      ...userData,
    },
  }

  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  }

  const mockedUserRepository =
    new UserRepositoryPrisma() as jest.Mocked<UserRepositoryPrisma>

  const mockedAuthService = new AuthServiceImpl(
    mockedUserRepository,
  ) as jest.Mocked<AuthServiceImpl>

  describe('When authenticating an user', () => {
    it('should authenticate an user with success', async () => {
      mockedAuthService.execute.mockResolvedValueOnce(result(generatedToken))

      const inTest = new AuthController(mockedAuthService)
      const response: Response = await inTest.auth(
        req as Request,
        res as Response,
      )

      const expectedStatusCode = 200

      expect(response.status).toHaveBeenCalledWith(expectedStatusCode)
      expect(response.send).toHaveBeenCalledWith(generatedToken)
    })

    it('should response with client error 401 when user does not exists or password does not match', async () => {
      mockedAuthService.execute.mockResolvedValueOnce(
        error(new UnauthorizedError()),
      )

      const inTest = new AuthController(mockedAuthService)
      const response: Response = await inTest.auth(
        req as Request,
        res as Response,
      )

      const expectedStatusCode = 401

      expect(response.status).toHaveBeenCalledWith(expectedStatusCode)
      expect(response.send).toHaveBeenCalledWith({
        path: raw.url,
        code: expectedStatusCode,
        error: HttpStatus.getStatusText(expectedStatusCode),
        message: new UnauthorizedError().message,
      })
    })

    it('should response with server error 500 when an unexpected error occurs', async () => {
      mockedAuthService.execute.mockRejectedValueOnce(
        new Error('unexpected error'),
      )

      const inTest = new AuthController(mockedAuthService)
      const response: Response = await inTest.auth(
        req as Request,
        res as Response,
      )

      const expectedStatusCode = 500

      expect(response.status).toHaveBeenCalledWith(expectedStatusCode)
      expect(response.send).toHaveBeenCalledWith({
        path: raw.url,
        code: expectedStatusCode,
        error: HttpStatus.getStatusText(expectedStatusCode),
        message: new ServerError().message,
      })
    })
  })
})
