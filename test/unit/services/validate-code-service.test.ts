import CacheNode from '@src/adapters/cache/node-cache'
import { AccountRepositoryPrisma } from '@src/adapters/repositories/account-repository-prisma'
import { AccountStatus } from '@src/models/account'
import { AccountNotFoundError } from '@src/services/errors/account-not-found-error'
import { ExpiredCodeError } from '@src/services/errors/expired-code-error'
import { InvalidCodeError } from '@src/services/errors/invalid-code-error'
import { StepDoneError } from '@src/services/errors/step-done-error'
import { ValidateCodeServiceImpl } from '@src/services/validate-code-service-impl'

jest.mock('@src/adapters/repositories/account-repository-prisma')

describe('Validate Code Service', () => {
  beforeEach(async () => {
    CacheNode.clearAllCache()
  })

  const mockedAccountRepository =
    new AccountRepositoryPrisma() as jest.Mocked<AccountRepositoryPrisma>

  const getInstanceOfTest = (): ValidateCodeServiceImpl => {
    return new ValidateCodeServiceImpl(mockedAccountRepository)
  }

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

  it('should validate code with success', async () => {
    CacheNode.set(accountDefault.email, '123456')

    mockedAccountRepository.findOne.mockResolvedValueOnce(createdAccount)

    const inTest = getInstanceOfTest()
    const result = await inTest.execute({
      email: accountDefault.email,
      code: '123456',
    })

    expect(result.isResult()).toBeTruthy()
    expect(result.value).toBeTruthy()
  })

  it('should throw an AccountNotFoundError when account does not exists', async () => {
    CacheNode.set(accountDefault.email, '123456')

    mockedAccountRepository.findOne.mockResolvedValueOnce(undefined)

    const inTest = getInstanceOfTest()
    const result = await inTest.execute({
      email: accountDefault.email,
      code: '123456',
    })

    expect(result.isError).toBeTruthy()
    expect(result.value).toBeInstanceOf(AccountNotFoundError)
  })

  it('should throw an StepDoneError when account has already done this step', async () => {
    CacheNode.set(accountDefault.email, '123456')

    mockedAccountRepository.findOne.mockResolvedValueOnce({
      ...createdAccount,
      status: AccountStatus.EMAIL_VALIDATED,
    })

    const inTest = getInstanceOfTest()
    const result = await inTest.execute({
      email: accountDefault.email,
      code: '123456',
    })

    expect(result.isError).toBeTruthy()
    expect(result.value).toBeInstanceOf(StepDoneError)
  })

  it('should throw an ExpiredCodeError when code is expired', async () => {
    mockedAccountRepository.findOne.mockResolvedValueOnce(createdAccount)

    const inTest = getInstanceOfTest()
    const result = await inTest.execute({
      email: accountDefault.email,
      code: '123456',
    })

    expect(result.isError).toBeTruthy()
    expect(result.value).toBeInstanceOf(ExpiredCodeError)
  })

  it('should throw an InvalidCodeError when code is expired', async () => {
    CacheNode.set(accountDefault.email, '123456')

    mockedAccountRepository.findOne.mockResolvedValueOnce(createdAccount)

    const inTest = getInstanceOfTest()
    const result = await inTest.execute({
      email: accountDefault.email,
      code: '12345',
    })

    expect(result.isError).toBeTruthy()
    expect(result.value).toBeInstanceOf(InvalidCodeError)
  })
})
