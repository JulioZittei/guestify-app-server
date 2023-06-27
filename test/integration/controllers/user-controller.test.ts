import { UserRepositoryPrisma } from '@src/adapters/repositories/user-repository'
import { ServerError } from '@src/controllers/errors/server-error'
import HttpStatus from 'http-status-codes'
import clientPrisma from '@src/adapters/repositories/client'
import { UserAlreadyExistsError } from '@src/services/errors/user-already-exists-error'
import { UserNotFoundError } from '@src/services/errors/user-not-found-error'
import { AuthService } from '@src/services/auth-service'

describe('User Controller Integration', () => {
  const userRepository = new UserRepositoryPrisma()

  const url = '/api/v1/users'

  const userDefault = {
    name: 'John',
    email: 'john@mail.com',
    phone: '(11) 99999-9999',
    password: '12345',
  }

  const responseUser = {
    name: userDefault.name,
    email: userDefault.email,
    phone: userDefault.phone,
  }

  beforeEach(async () => {
    await userRepository.deleteAll()
  })

  describe('When registering an user', () => {
    it('should register an user with success', async () => {
      const response = await global.testRequest.post(`${url}`).send(userDefault)

      const expectedStatusCode = 201

      expect(response).not.toBeNull()
      expect(response.statusCode).toBe(expectedStatusCode)
      expect(response.body).toMatchObject({
        id: expect.any(String),
        ...responseUser,
      })
    })

    it('should response with client error 409 when user already exists', async () => {
      await userRepository.create(userDefault)

      const response = await global.testRequest.post(`${url}`).send(userDefault)

      const expectedStatusCode = 409

      expect(response).not.toBeNull()
      expect(response.statusCode).toBe(expectedStatusCode)
      expect(response.body).toEqual({
        path: url,
        code: expectedStatusCode,
        error: HttpStatus.getStatusText(expectedStatusCode),
        message: new UserAlreadyExistsError(userDefault.email).message,
      })
    })

    it('should response with server error 500 when an unexpected error occurs', async () => {
      jest.spyOn(clientPrisma.user, 'findUnique').mockRejectedValueOnce({
        message: 'unexpected behavior',
      })

      const response = await global.testRequest.post(`${url}`).send(userDefault)

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

  describe('When getting an user', () => {
    it('should get an user with success', async () => {
      const createdUser = await userRepository.create(userDefault)
      const token = AuthService.generateToken(createdUser.id as string)
      const response = await global.testRequest
        .get(`${url}/me`)
        .set({ Authorization: `Bearer ${token}` })

      const expectedStatusCode = 200

      expect(response).not.toBeNull()
      expect(response.statusCode).toBe(expectedStatusCode)
      expect(response.body).toMatchObject({
        id: expect.any(String),
        ...responseUser,
      })
    })

    it('should response with client error 401 when user is not authenticated', async () => {
      const response = await global.testRequest.get(`${url}/me`)

      const expectedStatusCode = 401

      expect(response).not.toBeNull()
      expect(response.statusCode).toBe(expectedStatusCode)
    })

    it('should response with client error 404 when user does not exists', async () => {
      const token = AuthService.generateToken('invalid-userId')
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
        message: new UserNotFoundError('invalid-userId').message,
      })
    })

    it('should response with server error 500 when an unexpected error occurs', async () => {
      const createdUser = await userRepository.create(userDefault)
      const token = AuthService.generateToken(createdUser.id as string)
      jest.spyOn(clientPrisma.user, 'findUnique').mockRejectedValueOnce({
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
