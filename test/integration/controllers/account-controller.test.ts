import { AccountRepositoryPrisma } from '@src/adapters/repositories/account-repository-prisma'
import { ServerError } from '@src/controllers/errors/server-error'
import HttpStatus from 'http-status-codes'
import clientPrisma from '@src/adapters/repositories/client'
import { AccountAlreadyExistsError } from '@src/services/errors/account-already-exists-error'
import { AccountNotFoundError } from '@src/services/errors/account-not-found-error'
import { AuthServiceImpl } from '@src/services/auth-service-impl'
import { AccountStatus } from '@src/models/account'
import transporter from '@src/adapters/mail/client'
import CachNode from '@src/adapters/cache/node-cache'
import { StepDoneError } from '@src/services/errors/step-done-error'
import { MailServiceNodeMailer } from '@src/adapters/mail/mail-service-nodemailer'
import { ExpiredCodeError } from '@src/services/errors/expired-code-error'
import { InvalidCodeError } from '@src/services/errors/invalid-code-error'

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
    CachNode.clearAllCache()
    jest.restoreAllMocks()
  })

  describe('When registering an account', () => {
    it('should register an account with success', async () => {
      jest.spyOn(transporter, 'sendMail').mockResolvedValueOnce('Sent')

      const response = await global.testRequest
        .post(`${url}/register`)
        .send(accountDefault)

      const expectedStatusCode = 202

      expect(response).not.toBeNull()
      expect(response.statusCode).toBe(expectedStatusCode)
      expect(response.body).toMatchObject({
        status: AccountStatus.AWAITING_VALIDATION,
        message: `A verification code was sent to the email '${responseAccount.email}'. Please, validate the code to confirm your registration.`,
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

  describe('When requesting to resend the validation code', () => {
    it('should resend code with success - without cache', async () => {
      await accountRepository.create({
        ...accountDefault,
        status: AccountStatus.AWAITING_VALIDATION,
      })

      jest
        .spyOn(MailServiceNodeMailer.prototype, 'send')
        .mockResolvedValueOnce(true)

      const response = await global.testRequest
        .post(`${url}/register/resend/code`)
        .send({ email: accountDefault.email })

      const expectedStatusCode = 204

      expect(response).not.toBeNull()
      expect(response.statusCode).toBe(expectedStatusCode)
      expect(response.body).toEqual({})
    })
  })

  it('should resend code with success - with cache', async () => {
    await accountRepository.create({
      ...accountDefault,
      status: AccountStatus.AWAITING_VALIDATION,
    })

    CachNode.set(accountDefault.email, '123456')

    jest
      .spyOn(MailServiceNodeMailer.prototype, 'send')
      .mockResolvedValueOnce(true)

    const response = await global.testRequest
      .post(`${url}/register/resend/code`)
      .send({ email: accountDefault.email })

    const expectedStatusCode = 204

    expect(response).not.toBeNull()
    expect(response.statusCode).toBe(expectedStatusCode)
    expect(response.body).toEqual({})
  })

  it('should response with cliet error 404 when account does not exists', async () => {
    const response = await global.testRequest
      .post(`${url}/register/resend/code`)
      .send({ email: accountDefault.email })

    const expectedStatusCode = 404

    expect(response).not.toBeNull()
    expect(response.statusCode).toBe(expectedStatusCode)
    expect(response.body).toEqual({
      path: `${url}/register/resend/code`,
      code: expectedStatusCode,
      error: HttpStatus.getStatusText(expectedStatusCode),
      message: new AccountNotFoundError(accountDefault.email).message,
    })
  })

  it('should response with cliet error 410 when an account has already done this step', async () => {
    await accountRepository.create({
      ...accountDefault,
      status: AccountStatus.EMAIL_VALIDATED,
    })

    CachNode.set(accountDefault.email, '123456')

    jest
      .spyOn(MailServiceNodeMailer.prototype, 'send')
      .mockResolvedValueOnce(true)

    const response = await global.testRequest
      .post(`${url}/register/resend/code`)
      .send({ email: accountDefault.email })

    const expectedStatusCode = 410

    expect(response).not.toBeNull()
    expect(response.statusCode).toBe(expectedStatusCode)
    expect(response.body).toEqual({
      path: `${url}/register/resend/code`,
      code: expectedStatusCode,
      error: HttpStatus.getStatusText(expectedStatusCode),
      message: new StepDoneError().message,
    })
  })

  it('should response with server error 500 when an unexpected error occurs', async () => {
    await accountRepository.create({
      ...accountDefault,
      status: AccountStatus.AWAITING_VALIDATION,
    })

    CachNode.set(accountDefault.email, '123456')

    jest
      .spyOn(MailServiceNodeMailer.prototype, 'send')
      .mockImplementationOnce(async () => {
        throw new Error('Unexpected error')
      })

    const response = await global.testRequest
      .post(`${url}/register/resend/code`)
      .send({ email: accountDefault.email })

    const expectedStatusCode = 500

    expect(response).not.toBeNull()
    expect(response.statusCode).toBe(expectedStatusCode)
    expect(response.body).toEqual({
      path: `${url}/register/resend/code`,
      code: expectedStatusCode,
      error: HttpStatus.getStatusText(expectedStatusCode),
      message: new ServerError().message,
    })
  })

  describe('When requesting to validate code', () => {
    it('should response with no-content with success', async () => {
      await accountRepository.create({
        ...accountDefault,
        status: AccountStatus.AWAITING_VALIDATION,
      })

      CachNode.set(accountDefault.email, '123456')

      const response = await global.testRequest
        .post(`${url}/register/validate/code`)
        .send({ email: accountDefault.email, code: '123456' })

      const expectedStatusCode = 204

      expect(response).not.toBeNull()
      expect(response.statusCode).toBe(expectedStatusCode)
      expect(response.body).toEqual({})
    })

    it('should response with cliet error 404 when account does not exists', async () => {
      const response = await global.testRequest
        .post(`${url}/register/validate/code`)
        .send({ email: accountDefault.email, code: '123456' })

      const expectedStatusCode = 404

      expect(response).not.toBeNull()
      expect(response.statusCode).toBe(expectedStatusCode)
      expect(response.body).toEqual({
        path: `${url}/register/validate/code`,
        code: expectedStatusCode,
        error: HttpStatus.getStatusText(expectedStatusCode),
        message: new AccountNotFoundError(accountDefault.email).message,
      })
    })

    it('should response with client error 410 when account has already done this step', async () => {
      await accountRepository.create({
        ...accountDefault,
        status: AccountStatus.EMAIL_VALIDATED,
      })

      CachNode.set(accountDefault.email, '123456')

      const response = await global.testRequest
        .post(`${url}/register/validate/code`)
        .send({ email: accountDefault.email, code: '123456' })

      const expectedStatusCode = 410

      expect(response).not.toBeNull()
      expect(response.statusCode).toBe(expectedStatusCode)
      expect(response.body).toEqual({
        path: `${url}/register/validate/code`,
        code: expectedStatusCode,
        error: HttpStatus.getStatusText(expectedStatusCode),
        message: new StepDoneError().message,
      })
    })

    it('should response with client error 410 when code is expired', async () => {
      await accountRepository.create({
        ...accountDefault,
        status: AccountStatus.AWAITING_VALIDATION,
      })

      const response = await global.testRequest
        .post(`${url}/register/validate/code`)
        .send({ email: accountDefault.email, code: '123456' })

      const expectedStatusCode = 410

      expect(response).not.toBeNull()
      expect(response.statusCode).toBe(expectedStatusCode)
      expect(response.body).toEqual({
        path: `${url}/register/validate/code`,
        code: expectedStatusCode,
        error: HttpStatus.getStatusText(expectedStatusCode),
        message: new ExpiredCodeError().message,
      })
    })

    it('should response with client error 400 when code is invalid', async () => {
      await accountRepository.create({
        ...accountDefault,
        status: AccountStatus.AWAITING_VALIDATION,
      })

      CachNode.set(accountDefault.email, '123456')

      const response = await global.testRequest
        .post(`${url}/register/validate/code`)
        .send({ email: accountDefault.email, code: '1234' })

      const expectedStatusCode = 400

      expect(response).not.toBeNull()
      expect(response.statusCode).toBe(expectedStatusCode)
      expect(response.body).toEqual({
        path: `${url}/register/validate/code`,
        code: expectedStatusCode,
        error: HttpStatus.getStatusText(expectedStatusCode),
        message: new InvalidCodeError('1234').message,
      })
    })

    it('should response with server error 500 when an unexpected error occurs', async () => {
      jest.spyOn(clientPrisma.account, 'findUnique').mockRejectedValueOnce({
        message: 'unexpected behavior',
      })

      const response = await global.testRequest
        .post(`${url}/register/validate/code`)
        .send({ email: accountDefault.email, code: '1234' })

      const expectedStatusCode = 500

      expect(response).not.toBeNull()
      expect(response.statusCode).toBe(expectedStatusCode)
      expect(response.body).toEqual({
        path: `${url}/register/validate/code`,
        code: expectedStatusCode,
        error: HttpStatus.getStatusText(expectedStatusCode),
        message: new ServerError().message,
      })
    })
  })
})
