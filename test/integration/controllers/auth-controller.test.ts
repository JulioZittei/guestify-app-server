import { UserRepositoryPrisma } from '@src/adapters/repositories/user-repository-prisma'
import { ServerError } from '@src/controllers/errors/server-error'
import { UnauthorizedError } from '@src/services/errors/unauthorized-error'
import HttpStatus from 'http-status-codes'
import clientPrisma from '@src/adapters/repositories/client'

describe('Auth Controller Integration', () => {
  const userRepository = new UserRepositoryPrisma()

  const url = '/api/v1/auth'

  const userData = {
    email: 'john@mail.com',
    password: '12345',
  }

  const userDefault = {
    name: 'John',
    email: 'john@mail.com',
    phone: '(11) 99999-9999',
    password: '$2b$10$PNRZCsndk3R2aggYXZxMI.9XGOSwxspi1tsdHVFP7VlHb854mxvKS',
  }

  beforeEach(async () => {
    await userRepository.deleteAll()
  })

  describe('When authenticating an user', () => {
    it('should authenticate an user with success', async () => {
      await userRepository.create(userDefault)

      const response = await global.testRequest.post(url).send(userData)

      const expectedStatusCode = 200

      expect(response).not.toBeNull()
      expect(response.statusCode).toBe(expectedStatusCode)
      expect(response.body).toMatchObject({
        token: expect.any(String),
      })
    })

    it('should response with client error 401 when user does not exists or password does not match', async () => {
      const response = await global.testRequest
        .post('/api/v1/auth')
        .send(userData)

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
      jest.spyOn(clientPrisma.user, 'findUnique').mockImplementation(() => {
        throw new Error('unexpected error')
      })

      const response = await global.testRequest
        .post('/api/v1/auth')
        .send(userData)

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
