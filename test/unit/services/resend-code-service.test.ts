import CacheNode from '@src/adapters/cache/node-cache'
import { MailServiceNodeMailer } from '@src/adapters/mail/mail-service-nodemailer'
import { AccountRepositoryPrisma } from '@src/adapters/repositories/account-repository-prisma'
import { AccountStatus } from '@src/models/account'
import { AccountNotFoundError } from '@src/services/errors/account-not-found-error'
import { StepDoneError } from '@src/services/errors/step-done-error'
import { ResendCodeServiceImpl } from '@src/services/resend-code-service-impl'
import { MathUtil } from '@src/utils/math-util'

jest.mock('@src/adapters/repositories/account-repository-prisma')
jest.mock('@src/adapters/mail/mail-service-nodemailer')
jest.mock('@src/utils/math-util')

describe('Resend Code Service', () => {
  beforeEach(async () => {
    CacheNode.clearAllCache()
  })

  const mockedAccountRepository =
    new AccountRepositoryPrisma() as jest.Mocked<AccountRepositoryPrisma>

  const mockedMailService =
    new MailServiceNodeMailer() as jest.Mocked<MailServiceNodeMailer>

  const getInstanceOfTest = (): ResendCodeServiceImpl => {
    return new ResendCodeServiceImpl(mockedAccountRepository, mockedMailService)
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

  it('should resend validation code with success - without cache', async () => {
    mockedAccountRepository.findOne.mockResolvedValueOnce(createdAccount)
    mockedMailService.send.mockResolvedValueOnce(true)

    const inTest = getInstanceOfTest()
    const result = await inTest.execute({ email: accountDefault.email })

    expect(result.isResult()).toBeTruthy()
    expect(result.value).toBeTruthy()
    expect(MathUtil.generateRandomCode).toHaveBeenCalled()
  })

  it('should resend validation code with success - with cache', async () => {
    mockedAccountRepository.findOne.mockResolvedValueOnce(createdAccount)
    mockedMailService.send.mockResolvedValueOnce(true)

    CacheNode.set(accountDefault.email, '123456')

    const inTest = getInstanceOfTest()
    const result = await inTest.execute({ email: accountDefault.email })

    expect(result.isResult()).toBeTruthy()
    expect(result.value).toBeTruthy()
    expect(MathUtil.generateRandomCode).not.toHaveBeenCalled()
  })

  it('should throw an AccountNotFoundError when account does not exists', async () => {
    mockedAccountRepository.findOne.mockResolvedValueOnce(undefined)
    mockedMailService.send.mockResolvedValueOnce(true)

    const inTest = getInstanceOfTest()
    const result = await inTest.execute({ email: accountDefault.email })

    expect(result.isError()).toBeTruthy()
    expect(result.value).toBeInstanceOf(AccountNotFoundError)
  })

  it('should throw an StepDoneError when account has already done this step', async () => {
    mockedAccountRepository.findOne.mockResolvedValueOnce({
      ...createdAccount,
      status: AccountStatus.EMAIL_VALIDATED,
    })
    mockedMailService.send.mockResolvedValueOnce(true)

    const inTest = getInstanceOfTest()
    const result = await inTest.execute({ email: accountDefault.email })

    expect(result.isError()).toBeTruthy()
    expect(result.value).toBeInstanceOf(StepDoneError)
  })
})
