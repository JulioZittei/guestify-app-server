import { AccountRepositoryPrisma } from '@src/adapters/repositories/account-repository-prisma'
import { Request, Response } from '@src/controllers/default-controller'
import { ServerError } from '@src/controllers/errors/server-error'
import { AccountController } from '@src/controllers/account-controller'
import { AccountStatus } from '@src/models/account'
import { AccountAlreadyExistsError } from '@src/services/errors/account-already-exists-error'
import { AccountNotFoundError } from '@src/services/errors/account-not-found-error'
import { GetAccountInfoServiceImpl } from '@src/services/get-account-info-service-impl'
import { RegisterAccountServiceImpl } from '@src/services/register-account-service-impl'
import { error, result } from '@src/shared/either'
import { IncomingMessage } from 'http'
import HttpStatus from 'http-status-codes'

jest.mock('@src/services/register-account-service-impl')
jest.mock('@src/services/get-account-info-service-impl')
jest.mock('@src/adapters/repositories/account-repository-prisma')

describe('Account Controller', () => {
  const accountDefault = {
    name: 'John',
    email: 'john@mail.com',
    phone: '(11) 99999-9999',
    password: '12345',
  }

  const createdAccount = {
    id: 'f10b3c94-e28f-45b8-90a9-577a72c44143',
    ...accountDefault,
    password: '$2b$10$PNRZCsndk3R2aggYXZxMI.9XGOSwxspi1tsdHVFP7VlHb854mxvKS',
    status: AccountStatus.AWAITING_VALIDATION,
    createdAt: new Date('2023-06-26 14:35:11.279'),
    updateddAt: new Date('2023-06-26 14:35:11.279'),
  }

  const raw: Partial<IncomingMessage> = {
    url: '/api/v1/accounts/register',
  }

  const req: Partial<Request> = {
    raw: raw as IncomingMessage,
    body: accountDefault,
    user: {
      sub: createdAccount.id,
    },
    headers: { 'content-type': 'application/json' },
  }

  const res: Partial<Response> = {
    send: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
  }

  const mockedAccountRepository =
    new AccountRepositoryPrisma() as jest.Mocked<AccountRepositoryPrisma>

  const mockedRegisterAccountService = new RegisterAccountServiceImpl(
    mockedAccountRepository,
  ) as jest.Mocked<RegisterAccountServiceImpl>

  const mockedGetAccountInfoService = new GetAccountInfoServiceImpl(
    mockedAccountRepository,
  ) as jest.Mocked<GetAccountInfoServiceImpl>

  describe('When registering an account', () => {
    it('should response an account registered with success', async () => {
      mockedRegisterAccountService.execute.mockResolvedValueOnce(
        result(createdAccount),
      )

      const inTest = new AccountController(
        mockedRegisterAccountService,
        mockedGetAccountInfoService,
      )

      const response: Response = await inTest.registerAccount(
        req as Request,
        res as Response,
      )

      const expectedStatusCode = 202

      expect(response.status).toHaveBeenCalledWith(expectedStatusCode)
      expect(response.send).toHaveBeenCalledWith({
        status: AccountStatus.AWAITING_VALIDATION,
        message: `A verification code was sent to the email '${createdAccount.email}'. Please validate the code to confirm your registration.`,
        url: expect.any(String),
      })
    })

    it('should response with client error 409 when account already exists', async () => {
      mockedRegisterAccountService.execute.mockResolvedValueOnce(
        error(new AccountAlreadyExistsError(createdAccount.email)),
      )

      const inTest = new AccountController(
        mockedRegisterAccountService,
        mockedGetAccountInfoService,
      )

      const response: Response = await inTest.registerAccount(
        req as Request,
        res as Response,
      )

      const expectedStatusCode = 409

      expect(response.status).toHaveBeenCalledWith(expectedStatusCode)
      expect(response.send).toHaveBeenCalledWith({
        path: raw.url,
        code: expectedStatusCode,
        error: HttpStatus.getStatusText(expectedStatusCode),
        message: new AccountAlreadyExistsError(createdAccount.email).message,
      })
    })

    it('should response with server error 500 when an unexpected error occurs', async () => {
      mockedRegisterAccountService.execute.mockRejectedValue(
        new Error('unexpected error'),
      )

      const inTest = new AccountController(
        mockedRegisterAccountService,
        mockedGetAccountInfoService,
      )

      const response: Response = await inTest.registerAccount(
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

  describe('When getting account info', () => {
    it('should response with account data with success', async () => {
      mockedGetAccountInfoService.execute.mockResolvedValueOnce(
        result(createdAccount),
      )

      const inTest = new AccountController(
        mockedRegisterAccountService,
        mockedGetAccountInfoService,
      )

      const response: Response = await inTest.getAccountInfo(
        req as Request,
        res as Response,
      )
      const expectedStatusCode = 200

      expect(response.status).toHaveBeenCalledWith(expectedStatusCode)
      expect(response.send).toHaveBeenCalledWith({
        id: createdAccount.id,
        name: createdAccount.name,
        email: createdAccount.email,
        phone: createdAccount.phone,
        status: createdAccount.status,
      })
    })

    it('should response with client error 404 when account does not exists', async () => {
      mockedGetAccountInfoService.execute.mockResolvedValueOnce(
        error(new AccountNotFoundError(req.user?.sub as string)),
      )

      const inTest = new AccountController(
        mockedRegisterAccountService,
        mockedGetAccountInfoService,
      )

      const response: Response = await inTest.getAccountInfo(
        req as Request,
        res as Response,
      )
      const expectedStatusCode = 404

      expect(response.status).toHaveBeenCalledWith(expectedStatusCode)
      expect(response.send).toHaveBeenCalledWith({
        path: raw.url,
        code: expectedStatusCode,
        error: HttpStatus.getStatusText(expectedStatusCode),
        message: new AccountNotFoundError(req.user?.sub as string).message,
      })
    })

    it('should response with server error 500 when an unexpected error occurs', async () => {
      mockedGetAccountInfoService.execute.mockRejectedValueOnce(
        new Error('unexpected error'),
      )

      const inTest = new AccountController(
        mockedRegisterAccountService,
        mockedGetAccountInfoService,
      )

      const response: Response = await inTest.getAccountInfo(
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
