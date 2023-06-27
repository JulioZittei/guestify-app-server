import { Request } from '@src/controllers/default-controller'
import { authMiddleware } from '@src/middleware/auth'
import { AuthService } from '@src/services/auth-service'

describe('Auth Middleware', () => {
  it('should verify a JWT token and call next middleware', async () => {
    const jwtToken = AuthService.generateToken('fake')
    const req: Partial<Request> = {
      jwtVerify: jest.fn(),
      headers: {
        authorization: `Bearer ${jwtToken}`,
      },
    }

    await authMiddleware(req as Request)

    expect(req.jwtVerify).toHaveBeenCalled()
  })

  it('should response with client error 401 when there is problem with token verification', async () => {
    const req: Partial<Request> = {
      jwtVerify: jest.fn().mockImplementation(() => {
        throw new Error('Invalid token')
      }),

      headers: {
        authorization: `invalid`,
      },
    }

    try {
      await authMiddleware(req as Request)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      expect((error as Error).message as string).toEqual('Invalid token')
    }
  })
})
