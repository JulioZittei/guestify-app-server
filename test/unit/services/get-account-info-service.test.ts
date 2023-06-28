import { AccountRepositoryPrisma } from '@src/adapters/repositories/account-repository-prisma'
import { AccountStatus } from '@src/models/account'
import { AccountNotFoundError } from '@src/services/errors/account-not-found-error'
import { GetAccountInfoServiceImpl } from '@src/services/get-account-info-service-impl'

jest.mock('@src/adapters/repositories/account-repository-prisma')

describe('Get Account Service', () => {
  const accountId = 'f10b3c94-e28f-45b8-90a9-577a72c44143'

  const existsAccount = {
    id: 'f10b3c94-e28f-45b8-90a9-577a72c44143',
    name: 'John',
    email: 'john@mail.com',
    phone: '(11) 99999-9999',
    password: '$2b$10$PNRZCsndk3R2aggYXZxMI.9XGOSwxspi1tsdHVFP7VlHb854mxvKS',
    status: AccountStatus.AWAITING_VALIDATION,
    createdAt: new Date('2023-06-26 14:35:11.279'),
    updateddAt: new Date('2023-06-26 14:35:11.279'),
  }

  const mockedAccountRepository =
    new AccountRepositoryPrisma() as jest.Mocked<AccountRepositoryPrisma>

  it('should get an account with success', async () => {
    mockedAccountRepository.findOne.mockResolvedValueOnce(existsAccount)

    const inTest = new GetAccountInfoServiceImpl(mockedAccountRepository)
    const result = await inTest.execute(accountId)

    expect(result.isResult()).toBeTruthy()
    expect(result.value).toEqual(existsAccount)
  })

  it('should throw an AccountNotFoundError when account does not exists', async () => {
    mockedAccountRepository.findOne.mockResolvedValueOnce(undefined)

    const inTest = new GetAccountInfoServiceImpl(mockedAccountRepository)
    const result = await inTest.execute(accountId)

    expect(result.isError()).toBeTruthy()
    expect(result.value).toBeInstanceOf(AccountNotFoundError)
  })
})
