import { MailServiceNodeMailer } from '@src/adapters/mail/mail-service-nodemailer'
import { AccountRepositoryPrisma } from '@src/adapters/repositories/account-repository-prisma'
import { AccountStatus } from '@src/models/account'
import { AccountAlreadyExistsError } from '@src/services/errors/account-already-exists-error'
import { RegisterAccountServiceImpl } from '@src/services/register-account-service-impl'
import CacheNode from '@src/adapters/cache/node-cache'

jest.mock('@src/adapters/repositories/account-repository-prisma')
jest.mock('@src/adapters/mail/mail-service-nodemailer')

describe('Register Account Service', () => {
  const mockedAccountRepository =
    new AccountRepositoryPrisma() as jest.Mocked<AccountRepositoryPrisma>

  const mockedMailService =
    new MailServiceNodeMailer() as jest.Mocked<MailServiceNodeMailer>

  const getInstanceOfTest = (): RegisterAccountServiceImpl => {
    return new RegisterAccountServiceImpl(
      mockedAccountRepository,
      mockedMailService,
      CacheNode,
    )
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

  it('should register an account with success', async () => {
    mockedAccountRepository.create.mockResolvedValueOnce(createdAccount)

    const inTest = getInstanceOfTest()
    const result = await inTest.execute(accountDefault)

    expect(result.isResult()).toBeTruthy()
    expect(result.value).toEqual(createdAccount)
  })

  it('should throw an AccountAlreadyExistsError when account already exists', async () => {
    mockedAccountRepository.exists.mockResolvedValueOnce(true)

    const inTest = getInstanceOfTest()
    const result = await inTest.execute(accountDefault)

    expect(result.isError()).toBeTruthy()
    expect(result.value).toBeInstanceOf(AccountAlreadyExistsError)
  })
})
