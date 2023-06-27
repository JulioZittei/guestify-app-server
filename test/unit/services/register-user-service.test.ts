import { UserRepositoryPrisma } from '@src/adapters/repositories/user-repository'
import { UserAlreadyExistsError } from '@src/services/errors/user-already-exists-error'
import { RegisterUserService } from '@src/services/register-user-service'

jest.mock('@src/adapters/repositories/user-repository')

describe('Register User Service', () => {
  const mockedUserRepository =
    new UserRepositoryPrisma() as jest.Mocked<UserRepositoryPrisma>

  const userDefault = {
    name: 'John',
    email: 'john@mail.com',
    phone: '(11) 99999-9999',
    password: '12345',
  }

  const createdUser = {
    id: 'f10b3c94-e28f-45b8-90a9-577a72c44143',
    ...userDefault,
    password: '$2b$10$PNRZCsndk3R2aggYXZxMI.9XGOSwxspi1tsdHVFP7VlHb854mxvKS',
    createdAt: new Date('2023-06-26 14:35:11.279'),
    updateddAt: new Date('2023-06-26 14:35:11.279'),
  }

  it('should register an user with success', async () => {
    mockedUserRepository.create.mockResolvedValueOnce(createdUser)

    const inTest = new RegisterUserService(mockedUserRepository)
    const result = await inTest.execute(userDefault)

    expect(result.isResult()).toBeTruthy()
    expect(result.value).toEqual(createdUser)
  })

  it('should throw an UserAlreadyExistsError when user already exists', async () => {
    mockedUserRepository.exists.mockResolvedValueOnce(true)

    const inTest = new RegisterUserService(mockedUserRepository)
    const result = await inTest.execute(userDefault)

    expect(result.isError()).toBeTruthy()
    expect(result.value).toBeInstanceOf(UserAlreadyExistsError)
  })
})
