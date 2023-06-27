import { UserRepositoryPrisma } from '@src/adapters/repositories/user-repository'
import { AuthService } from '@src/services/auth-service'
import { UnauthorizedError } from '@src/services/errors/unauthorized-error'
import { TokenResponse } from '@src/services/responses/auth-user-response'

jest.mock('@src/adapters/repositories/user-repository')

describe('Auth Service', () => {
  const userData = {
    email: 'john@mail.com',
    password: '12345',
  }

  const existsUser = {
    id: 'f10b3c94-e28f-45b8-90a9-577a72c44143',
    name: 'John',
    email: 'john@mail.com',
    phone: '(11) 99999-9999',
    password: '$2b$10$PNRZCsndk3R2aggYXZxMI.9XGOSwxspi1tsdHVFP7VlHb854mxvKS',
    createdAt: new Date('2023-06-26 14:35:11.279'),
    updateddAt: new Date('2023-06-26 14:35:11.279'),
  }

  const mockedUserRepository =
    new UserRepositoryPrisma() as jest.Mocked<UserRepositoryPrisma>

  it('should authenticate an user with success', async () => {
    mockedUserRepository.findOne.mockResolvedValueOnce(existsUser)

    const inTest = new AuthService(mockedUserRepository)
    const result = await inTest.execute(userData)

    const jwtTokenDecoded = AuthService.decodeToken(
      (result.value as TokenResponse).token,
    )

    expect(result.isResult()).toBeTruthy()
    expect(result.value).toEqual(
      expect.objectContaining({
        token: expect.any(String),
      }),
    )
    expect(jwtTokenDecoded).toMatchObject({
      sub: existsUser.id,
    })
  })

  it('should throw an UnauthorizedError when user password does not match', async () => {
    mockedUserRepository.findOne.mockResolvedValueOnce(existsUser)

    const inTest = new AuthService(mockedUserRepository)
    const result = await inTest.execute({
      ...userData,
      password: 'invalid-password',
    })

    expect(result.isError()).toBeTruthy()
    expect(result.value).toBeInstanceOf(UnauthorizedError)
  })

  it('should throw an UnauthorizedError when user does not exists', async () => {
    mockedUserRepository.findOne.mockResolvedValueOnce(undefined)

    const inTest = new AuthService(mockedUserRepository)
    const result = await inTest.execute(userData)

    expect(result.isError()).toBeTruthy()
    expect(result.value).toBeInstanceOf(UnauthorizedError)
  })

  it('should hash a given password with success', async () => {
    const hashedPassword = await AuthService.hashPassword(userData.password)

    expect(hashedPassword.length).toBeGreaterThan(userData.password.length)
  })

  it('should compare a given password with success when password match', async () => {
    const hashedPassword = await AuthService.hashPassword(userData.password)

    await expect(
      AuthService.comparePasswords(userData.password, hashedPassword),
    ).resolves.toBeTruthy()
  })

  it('should compare a given password with success when password does not match', async () => {
    const hashedPassword = await AuthService.hashPassword(userData.password)

    await expect(
      AuthService.comparePasswords('invalid-password', hashedPassword),
    ).resolves.toBeFalsy()
  })

  it('should generate a token with success', async () => {
    const token = AuthService.generateToken(userData.email)

    expect(token).not.toEqual(userData.email)
    expect(token.length).toBeGreaterThan(userData.email.length)
  })

  it('should decode a token with success', async () => {
    const token = AuthService.generateToken(userData.email)
    const decodeToken = AuthService.decodeToken(token)

    expect(decodeToken).not.toBeNull()
    expect(decodeToken).toMatchObject({
      sub: userData.email,
    })
  })
})
