import { User } from '@prisma/client'
import clientPrisma from '@src/adapters/repositories/client'
import { UserRepositoryPrisma } from '@src/adapters/repositories/user-repository'

describe('User Repository Prisma', () => {
  const userDefault = {
    name: 'John',
    email: 'john@mail.com',
    phone: '(11) 99999-9999',
    password: '12345',
  }

  const createdUser: User = {
    id: 'f10b3c94-e28f-45b8-90a9-577a72c44143',
    ...userDefault,
    password: '$2b$10$PNRZCsndk3R2aggYXZxMI.9XGOSwxspi1tsdHVFP7VlHb854mxvKS',
    createdAt: new Date('2023-06-26 14:35:11.279'),
    updatedAt: new Date('2023-06-26 14:35:11.279'),
  }

  describe('When saving an user', () => {
    it('should save an user with success', async () => {
      jest.spyOn(clientPrisma.user, 'create').mockResolvedValueOnce(createdUser)

      const inTest = new UserRepositoryPrisma()
      const user = await inTest.create(userDefault)

      expect(user).not.toBeNull()
      expect(user).toEqual(createdUser)
    })

    it('should throw an unexpected error', async () => {
      jest.spyOn(clientPrisma.user, 'create').mockImplementation(() => {
        throw new Error('unexpected error')
      })

      const inTest = new UserRepositoryPrisma()

      try {
        await inTest.create(userDefault)
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message as string).toEqual('unexpected error')
      }
    })
  })

  describe('When finding one user by a given filter', () => {
    it('should get one user with success', async () => {
      jest
        .spyOn(clientPrisma.user, 'findUnique')
        .mockResolvedValueOnce(createdUser)

      const inTest = new UserRepositoryPrisma()
      const user = await inTest.findOne({ email: userDefault.email })

      expect(user).not.toBeNull()
      expect(user).toEqual(createdUser)
    })

    it('should throw an unexpected error', async () => {
      jest.spyOn(clientPrisma.user, 'findUnique').mockImplementation(() => {
        throw new Error('unexpected error')
      })

      const inTest = new UserRepositoryPrisma()

      try {
        await inTest.findOne(userDefault)
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message as string).toEqual('unexpected error')
      }
    })
  })

  describe('When verify if an user exists', () => {
    it('should get one user with success', async () => {
      jest
        .spyOn(clientPrisma.user, 'findUnique')
        .mockResolvedValueOnce(createdUser)

      const inTest = new UserRepositoryPrisma()
      const exists = await inTest.exists({ email: userDefault.email })

      expect(exists).not.toBeNull()
      expect(exists).toBeTruthy()
    })

    it('should throw an unexpected error', async () => {
      jest.spyOn(clientPrisma.user, 'findUnique').mockImplementation(() => {
        throw new Error('unexpected error')
      })

      const inTest = new UserRepositoryPrisma()

      try {
        await inTest.exists(userDefault)
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message as string).toEqual('unexpected error')
      }
    })
  })

  describe('When finding a list of user by a given filter', () => {
    it('should save an user with success', async () => {
      jest
        .spyOn(clientPrisma.user, 'findUnique')
        .mockResolvedValueOnce(createdUser)

      const inTest = new UserRepositoryPrisma()
      const user = await inTest.findOne({ email: userDefault.email })

      expect(user).not.toBeNull()
      expect(user).toEqual(createdUser)
    })

    it('should throw an unexpected error', async () => {
      jest.spyOn(clientPrisma.user, 'findUnique').mockImplementation(() => {
        throw new Error('unexpected error')
      })

      const inTest = new UserRepositoryPrisma()

      try {
        await inTest.findOne(userDefault)
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message as string).toEqual('unexpected error')
      }
    })
  })

  describe('When finding users by a given filter', () => {
    it('should get a list of users with success', async () => {
      jest
        .spyOn(clientPrisma.user, 'findMany')
        .mockResolvedValueOnce([createdUser])

      const inTest = new UserRepositoryPrisma()
      const users = await inTest.findAll({ email: userDefault.email })

      expect(users).not.toBeNull()
      expect(users).toEqual([createdUser])
    })

    it('should throw an unexpected error', async () => {
      jest.spyOn(clientPrisma.user, 'findMany').mockImplementation(() => {
        throw new Error('unexpected error')
      })

      const inTest = new UserRepositoryPrisma()

      try {
        await inTest.findAll(userDefault)
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message as string).toEqual('unexpected error')
      }
    })
  })

  describe('When deleting all users', () => {
    it('should delete all users with success', async () => {
      jest.spyOn(clientPrisma.user, 'deleteMany').mockReturnThis()

      const inTest = new UserRepositoryPrisma()

      await inTest.deleteAll()
      expect(clientPrisma.user.deleteMany).toHaveBeenCalled()
    })

    it('should throw an unexpected error', async () => {
      jest.spyOn(clientPrisma.user, 'deleteMany').mockImplementation(() => {
        throw new Error('unexpected error')
      })

      const inTest = new UserRepositoryPrisma()

      try {
        await inTest.deleteAll()
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message as string).toEqual('unexpected error')
      }
    })
  })
})
