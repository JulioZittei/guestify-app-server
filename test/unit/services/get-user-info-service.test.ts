import { UserRepositoryPrisma } from '@src/adapters/repositories/user-repository-prisma'
import { UserNotFoundError } from '@src/services/errors/user-not-found-error'
import { GetUserInfoServiceImpl } from '@src/services/get-user-info-service-impl'

jest.mock('@src/adapters/repositories/user-repository-prisma')

describe('Get User Service', () => {
  const userId = 'f10b3c94-e28f-45b8-90a9-577a72c44143'

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

  it('should get an user with success', async () => {
    mockedUserRepository.findOne.mockResolvedValueOnce(existsUser)

    const inTest = new GetUserInfoServiceImpl(mockedUserRepository)
    const result = await inTest.execute(userId)

    expect(result.isResult()).toBeTruthy()
    expect(result.value).toEqual(existsUser)
  })

  it('should throw an UserNotFoundError when user does not exists', async () => {
    mockedUserRepository.findOne.mockResolvedValueOnce(undefined)

    const inTest = new GetUserInfoServiceImpl(mockedUserRepository)
    const result = await inTest.execute(userId)

    expect(result.isError()).toBeTruthy()
    expect(result.value).toBeInstanceOf(UserNotFoundError)
  })
})
