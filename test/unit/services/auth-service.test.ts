import { AccountRepositoryPrisma } from '@src/adapters/repositories/account-repository-prisma'
import { AccountStatus } from '@src/models/account'
import { AuthServiceImpl } from '@src/services/auth-service-impl'
import { EmailConfirmationPendingError } from '@src/services/errors/email-confirmation-pending-error'
import { UnauthorizedError } from '@src/services/errors/unauthorized-error'
import { TokenResponse } from '@src/services/responses/auth-response'

jest.mock('@src/adapters/repositories/account-repository-prisma')

describe('Auth Service', () => {
  const accountData = {
    email: 'john@mail.com',
    password: '12345',
  }

  const existsAccount = {
    id: 'f10b3c94-e28f-45b8-90a9-577a72c44143',
    name: 'John',
    email: 'john@mail.com',
    phone: '(11) 99999-9999',
    status: AccountStatus.EMAIL_VALIDATED,
    password: '$2b$10$PNRZCsndk3R2aggYXZxMI.9XGOSwxspi1tsdHVFP7VlHb854mxvKS',
    createdAt: new Date('2023-06-26 14:35:11.279'),
    updateddAt: new Date('2023-06-26 14:35:11.279'),
  }

  const mockedAccountRepository =
    new AccountRepositoryPrisma() as jest.Mocked<AccountRepositoryPrisma>

  it('should authenticate an account with success', async () => {
    mockedAccountRepository.findOne.mockResolvedValueOnce(existsAccount)

    const inTest = new AuthServiceImpl(mockedAccountRepository)
    const result = await inTest.execute(accountData)

    const jwtTokenDecoded = AuthServiceImpl.decodeToken(
      (result.value as TokenResponse).token,
    )

    expect(result.isResult()).toBeTruthy()
    expect(result.value).toEqual(
      expect.objectContaining({
        token: expect.any(String),
      }),
    )
    expect(jwtTokenDecoded).toMatchObject({
      sub: existsAccount.id,
    })
  })

  it('should throw an UnauthorizedError when account password does not match', async () => {
    mockedAccountRepository.findOne.mockResolvedValueOnce(existsAccount)

    const inTest = new AuthServiceImpl(mockedAccountRepository)
    const result = await inTest.execute({
      ...accountData,
      password: 'invalid-password',
    })

    expect(result.isError()).toBeTruthy()
    expect(result.value).toBeInstanceOf(UnauthorizedError)
  })

  it('should throw an UnauthorizedError when account does not exists', async () => {
    mockedAccountRepository.findOne.mockResolvedValueOnce(undefined)

    const inTest = new AuthServiceImpl(mockedAccountRepository)
    const result = await inTest.execute(accountData)

    expect(result.isError()).toBeTruthy()
    expect(result.value).toBeInstanceOf(UnauthorizedError)
  })

  it('should throw an EmailConfirmationPendingError when email confirmation is pending', async () => {
    mockedAccountRepository.findOne.mockResolvedValueOnce({
      ...existsAccount,
      status: AccountStatus.AWAITING_VALIDATION,
    })

    const inTest = new AuthServiceImpl(mockedAccountRepository)
    const result = await inTest.execute(accountData)

    expect(result.isError()).toBeTruthy()
    expect(result.value).toBeInstanceOf(EmailConfirmationPendingError)
  })

  it('should hash a given password with success', async () => {
    const hashedPassword = await AuthServiceImpl.hashPassword(
      accountData.password,
    )

    expect(hashedPassword.length).toBeGreaterThan(accountData.password.length)
  })

  it('should compare a given password with success when password match', async () => {
    const hashedPassword = await AuthServiceImpl.hashPassword(
      accountData.password,
    )

    await expect(
      AuthServiceImpl.comparePasswords(accountData.password, hashedPassword),
    ).resolves.toBeTruthy()
  })

  it('should compare a given password with success when password does not match', async () => {
    const hashedPassword = await AuthServiceImpl.hashPassword(
      accountData.password,
    )

    await expect(
      AuthServiceImpl.comparePasswords('invalid-password', hashedPassword),
    ).resolves.toBeFalsy()
  })

  it('should generate a token with success', async () => {
    const token = AuthServiceImpl.generateToken(accountData.email)

    expect(token).not.toEqual(accountData.email)
    expect(token.length).toBeGreaterThan(accountData.email.length)
  })

  it('should decode a token with success', async () => {
    const token = AuthServiceImpl.generateToken(accountData.email)
    const decodeToken = AuthServiceImpl.decodeToken(token)

    expect(decodeToken).not.toBeNull()
    expect(decodeToken).toMatchObject({
      sub: accountData.email,
    })
  })
})
