import { UserRepositoryPrisma } from '@src/adapters/repositories/user-repository-prisma'
import { Request, Response } from '@src/controllers/default-controller'
import { ServerError } from '@src/controllers/errors/server-error'
import { UserController } from '@src/controllers/user-controller'
import { UserAlreadyExistsError } from '@src/services/errors/user-already-exists-error'
import { UserNotFoundError } from '@src/services/errors/user-not-found-error'
import { GetUserInfoServiceImpl } from '@src/services/get-user-info-service-impl'
import { RegisterUserServiceImpl } from '@src/services/register-user-service-impl'
import { error, result } from '@src/shared/either'
import { IncomingMessage } from 'http'
import HttpStatus from 'http-status-codes'

jest.mock('@src/services/register-user-service-impl')
jest.mock('@src/services/get-user-info-service-impl')
jest.mock('@src/adapters/repositories/user-repository-prisma')

describe('User Controller', () => {
  const userDefault = {
    name: 'John',
    email: 'john@mail.com',
    phone: '(11) 99999-9999',
    password: '12345',
  }

  const createdUser = {
    id: 'f10b3c94-e28f-45b8-90a9-577a72c44143',
    ...userDefault,
    password: '$2b$10$PNRZCsndk3R2aggYXZxMI.9XGOSwxspi1tsdHVFP7VlHb854mxvKS',
    createdAt: new Date('2023-06-26 14:35:11.279'),
    updateddAt: new Date('2023-06-26 14:35:11.279'),
  }

  const raw: Partial<IncomingMessage> = {
    url: '/api/v1/users',
  }

  const req: Partial<Request> = {
    raw: raw as IncomingMessage,
    body: userDefault,
    user: {
      sub: createdUser.id,
    },
    headers: { 'content-type': 'application/json' },
  }

  const res: Partial<Response> = {
    send: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
  }

  const mockedUserRepository =
    new UserRepositoryPrisma() as jest.Mocked<UserRepositoryPrisma>

  const mockedRegisterUserService = new RegisterUserServiceImpl(
    mockedUserRepository,
  ) as jest.Mocked<RegisterUserServiceImpl>

  const mockedGetUserInfoService = new GetUserInfoServiceImpl(
    mockedUserRepository,
  ) as jest.Mocked<GetUserInfoServiceImpl>

  describe('When registering an user', () => {
    it('should response an user registered with success', async () => {
      mockedRegisterUserService.execute.mockResolvedValueOnce(
        result(createdUser),
      )

      const inTest = new UserController(
        mockedRegisterUserService,
        mockedGetUserInfoService,
      )

      const response: Response = await inTest.registerUser(
        req as Request,
        res as Response,
      )

      const expectedStatusCode = 201

      expect(response.status).toHaveBeenCalledWith(expectedStatusCode)
      expect(response.send).toHaveBeenCalledWith({
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        phone: createdUser.phone,
      })
    })

    it('should response with client error 409 when user already exists', async () => {
      mockedRegisterUserService.execute.mockResolvedValueOnce(
        error(new UserAlreadyExistsError(createdUser.email)),
      )

      const inTest = new UserController(
        mockedRegisterUserService,
        mockedGetUserInfoService,
      )

      const response: Response = await inTest.registerUser(
        req as Request,
        res as Response,
      )

      const expectedStatusCode = 409

      expect(response.status).toHaveBeenCalledWith(expectedStatusCode)
      expect(response.send).toHaveBeenCalledWith({
        path: raw.url,
        code: expectedStatusCode,
        error: HttpStatus.getStatusText(expectedStatusCode),
        message: new UserAlreadyExistsError(createdUser.email).message,
      })
    })

    it('should response with server error 500 when an unexpected error occurs', async () => {
      mockedRegisterUserService.execute.mockRejectedValue(
        new Error('unexpected error'),
      )

      const inTest = new UserController(
        mockedRegisterUserService,
        mockedGetUserInfoService,
      )

      const response: Response = await inTest.registerUser(
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

  describe('When getting user info', () => {
    it('should response with user data with success', async () => {
      mockedGetUserInfoService.execute.mockResolvedValueOnce(
        result(createdUser),
      )

      const inTest = new UserController(
        mockedRegisterUserService,
        mockedGetUserInfoService,
      )

      const response: Response = await inTest.getUserInfo(
        req as Request,
        res as Response,
      )
      const expectedStatusCode = 200

      expect(response.status).toHaveBeenCalledWith(expectedStatusCode)
      expect(response.send).toHaveBeenCalledWith({
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        phone: createdUser.phone,
      })
    })

    it('should response with client error 404 when user does not exists', async () => {
      mockedGetUserInfoService.execute.mockResolvedValueOnce(
        error(new UserNotFoundError(req.user?.sub as string)),
      )

      const inTest = new UserController(
        mockedRegisterUserService,
        mockedGetUserInfoService,
      )

      const response: Response = await inTest.getUserInfo(
        req as Request,
        res as Response,
      )
      const expectedStatusCode = 404

      expect(response.status).toHaveBeenCalledWith(expectedStatusCode)
      expect(response.send).toHaveBeenCalledWith({
        path: raw.url,
        code: expectedStatusCode,
        error: HttpStatus.getStatusText(expectedStatusCode),
        message: new UserNotFoundError(req.user?.sub as string).message,
      })
    })

    it('should response with server error 500 when an unexpected error occurs', async () => {
      mockedGetUserInfoService.execute.mockRejectedValueOnce(
        new Error('unexpected error'),
      )

      const inTest = new UserController(
        mockedRegisterUserService,
        mockedGetUserInfoService,
      )

      const response: Response = await inTest.getUserInfo(
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
