import { AccountRepositoryPrisma } from '@src/adapters/repositories/account-repository-prisma'
import { ServerError } from '@src/controllers/errors/server-error'
import { UnauthorizedError } from '@src/services/errors/unauthorized-error'
import HttpStatus from 'http-status-codes'
import clientPrisma from '@src/adapters/repositories/client'
import { AccountStatus } from '@src/models/account'

describe('Auth Controller Integration', () => {
  const accountRepository = new AccountRepositoryPrisma()

  const url = '/api/v1/auth'

  const accountData = {
    email: 'john@mail.com',
    password: '12345',
  }

  const accountDefault = {
    name: 'John',
    email: 'john@mail.com',
    phone: '(11) 99999-9999',
    password: '$2b$10$PNRZCsndk3R2aggYXZxMI.9XGOSwxspi1tsdHVFP7VlHb854mxvKS',
    status: AccountStatus.AWAITING_VALIDATION,
  }

  beforeEach(async () => {
    await accountRepository.deleteAll()
  })

  describe('When authenticating an account', () => {
    it('should authenticate an account with success', async () => {
      await accountRepository.create(accountDefault)

      const response = await global.testRequest.post(url).send(accountData)

      const expectedStatusCode = 200

      expect(response).not.toBeNull()
      expect(response.statusCode).toBe(expectedStatusCode)
      expect(response.body).toMatchObject({
        token: expect.any(String),
      })
    })

    it('should response with client error 401 when account does not exists or password does not match', async () => {
      const response = await global.testRequest
        .post('/api/v1/auth')
        .send(accountData)

      const expectedStatusCode = 401

      expect(response).not.toBeNull()
      expect(response.statusCode).toBe(expectedStatusCode)
      expect(response.body).toEqual({
        path: url,
        code: expectedStatusCode,
        error: HttpStatus.getStatusText(expectedStatusCode),
        message: new UnauthorizedError().message,
      })
    })

    it('should response with server error 500 when an unexpected error occurs', async () => {
      jest.spyOn(clientPrisma.account, 'findUnique').mockImplementation(() => {
        throw new Error('unexpected error')
      })

      const response = await global.testRequest
        .post('/api/v1/auth')
        .send(accountData)

      const expectedStatusCode = 500

      expect(response).not.toBeNull()
      expect(response.statusCode).toBe(expectedStatusCode)
      expect(response.body).toEqual({
        path: url,
        code: expectedStatusCode,
        error: HttpStatus.getStatusText(expectedStatusCode),
        message: new ServerError().message,
      })
    })
  })
})
