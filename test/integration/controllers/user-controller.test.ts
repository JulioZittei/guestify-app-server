import { AccountRepositoryPrisma } from '@src/adapters/repositories/account-repository-prisma'
import { ServerError } from '@src/controllers/errors/server-error'
import HttpStatus from 'http-status-codes'
import clientPrisma from '@src/adapters/repositories/client'
import { AccountAlreadyExistsError } from '@src/services/errors/account-already-exists-error'
import { AccountNotFoundError } from '@src/services/errors/account-not-found-error'
import { AuthServiceImpl } from '@src/services/auth-service-impl'
import { AccountStatus } from '@src/models/account'

describe('Account Controller Integration', () => {
  const accountRepository = new AccountRepositoryPrisma()

  const url = '/api/v1/accounts'

  const accountDefault = {
    name: 'John',
    email: 'john@mail.com',
    phone: '(11) 99999-9999',
    password: '12345',
  }

  const responseAccount = {
    name: accountDefault.name,
    email: accountDefault.email,
    phone: accountDefault.phone,
  }

  beforeEach(async () => {
    await accountRepository.deleteAll()
  })

  describe('When registering an account', () => {
    it('should register an account with success', async () => {
      const response = await global.testRequest
        .post(`${url}/register`)
        .send(accountDefault)

      const expectedStatusCode = 202

      expect(response).not.toBeNull()
      expect(response.statusCode).toBe(expectedStatusCode)
      expect(response.body).toMatchObject({
        status: AccountStatus.AWAITING_VALIDATION,
        message: `A verification code was sent to the email '${responseAccount.email}'. Please validate the code to confirm your registration.`,
        url: expect.any(String),
      })
    })

    it('should response with client error 409 when account already exists', async () => {
      await accountRepository.create({
        ...accountDefault,
        status: AccountStatus.AWAITING_VALIDATION,
      })

      const response = await global.testRequest
        .post(`${url}/register`)
        .send(accountDefault)

      const expectedStatusCode = 409

      expect(response).not.toBeNull()
      expect(response.statusCode).toBe(expectedStatusCode)
      expect(response.body).toEqual({
        path: `${url}/register`,
        code: expectedStatusCode,
        error: HttpStatus.getStatusText(expectedStatusCode),
        message: new AccountAlreadyExistsError(accountDefault.email).message,
      })
    })

    it('should response with server error 500 when an unexpected error occurs', async () => {
      jest.spyOn(clientPrisma.account, 'findUnique').mockRejectedValueOnce({
        message: 'unexpected behavior',
      })

      const response = await global.testRequest
        .post(`${url}/register`)
        .send(accountDefault)

      const expectedStatusCode = 500

      expect(response).not.toBeNull()
      expect(response.statusCode).toBe(expectedStatusCode)
      expect(response.body).toEqual({
        path: `${url}/register`,
        code: expectedStatusCode,
        error: HttpStatus.getStatusText(expectedStatusCode),
        message: new ServerError().message,
      })
    })
  })

  describe('When getting an account', () => {
    it('should get an account with success', async () => {
      const createdAccount = await accountRepository.create({
        ...accountDefault,
        status: AccountStatus.AWAITING_VALIDATION,
      })
      const token = AuthServiceImpl.generateToken(createdAccount.id as string)
      const response = await global.testRequest
        .get(`${url}/me`)
        .set({ Authorization: `Bearer ${token}` })

      const expectedStatusCode = 200

      expect(response).not.toBeNull()
      expect(response.statusCode).toBe(expectedStatusCode)
      expect(response.body).toMatchObject({
        id: expect.any(String),
        ...responseAccount,
      })
    })

    it('should response with client error 401 when account is not authenticated', async () => {
      const response = await global.testRequest.get(`${url}/me`)

      const expectedStatusCode = 401

      expect(response).not.toBeNull()
      expect(response.statusCode).toBe(expectedStatusCode)
    })

    it('should response with client error 404 when account does not exists', async () => {
      const token = AuthServiceImpl.generateToken('invalid-accountId')
      const response = await global.testRequest
        .get(`${url}/me`)
        .set({ Authorization: `Bearer ${token}` })

      const expectedStatusCode = 404

      expect(response).not.toBeNull()
      expect(response.statusCode).toBe(expectedStatusCode)
      expect(response.body).toEqual({
        path: `${url}/me`,
        code: expectedStatusCode,
        error: HttpStatus.getStatusText(expectedStatusCode),
        message: new AccountNotFoundError('invalid-accountId').message,
      })
    })

    it('should response with server error 500 when an unexpected error occurs', async () => {
      const createdAccount = await accountRepository.create({
        ...accountDefault,
        status: AccountStatus.AWAITING_VALIDATION,
      })
      const token = AuthServiceImpl.generateToken(createdAccount.id as string)
      jest.spyOn(clientPrisma.account, 'findUnique').mockRejectedValueOnce({
        message: 'unexpected behavior',
      })

      const response = await global.testRequest
        .get(`${url}/me`)
        .set({ Authorization: `Bearer ${token}` })

      const expectedStatusCode = 500

      expect(response).not.toBeNull()
      expect(response.statusCode).toBe(expectedStatusCode)
      expect(response.body).toEqual({
        path: `${url}/me`,
        code: expectedStatusCode,
        error: HttpStatus.getStatusText(expectedStatusCode),
        message: new ServerError().message,
      })
    })
  })
})
