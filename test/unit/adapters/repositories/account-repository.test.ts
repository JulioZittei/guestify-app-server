import { Account } from '@prisma/client'
import clientPrisma from '@src/adapters/repositories/client'
import { AccountRepositoryPrisma } from '@src/adapters/repositories/account-repository-prisma'
import { AccountStatus } from '@src/models/account'

describe('Account Repository Prisma', () => {
  const accountDefault = {
    name: 'John',
    email: 'john@mail.com',
    phone: '(11) 99999-9999',
    password: '12345',
    status: AccountStatus.AWAITING_VALIDATION,
  }

  const createdAccount: Account = {
    id: 'f10b3c94-e28f-45b8-90a9-577a72c44143',
    ...accountDefault,
    password: '$2b$10$PNRZCsndk3R2aggYXZxMI.9XGOSwxspi1tsdHVFP7VlHb854mxvKS',
    createdAt: new Date('2023-06-26 14:35:11.279'),
    updatedAt: new Date('2023-06-26 14:35:11.279'),
  }

  describe('When saving an account', () => {
    it('should save an account with success', async () => {
      jest
        .spyOn(clientPrisma.account, 'create')
        .mockResolvedValueOnce(createdAccount)

      const inTest = new AccountRepositoryPrisma()
      const account = await inTest.create(accountDefault)

      expect(account).not.toBeNull()
      expect(account).toEqual(createdAccount)
    })

    it('should throw an unexpected error', async () => {
      jest.spyOn(clientPrisma.account, 'create').mockImplementation(() => {
        throw new Error('unexpected error')
      })

      const inTest = new AccountRepositoryPrisma()

      try {
        await inTest.create(accountDefault)
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message as string).toEqual('unexpected error')
      }
    })
  })

  describe('When finding one account by a given filter', () => {
    it('should get one account with success', async () => {
      jest
        .spyOn(clientPrisma.account, 'findUnique')
        .mockResolvedValueOnce(createdAccount)

      const inTest = new AccountRepositoryPrisma()
      const account = await inTest.findOne({ email: accountDefault.email })

      expect(account).not.toBeNull()
      expect(account).toEqual(createdAccount)
    })

    it('should throw an unexpected error', async () => {
      jest.spyOn(clientPrisma.account, 'findUnique').mockImplementation(() => {
        throw new Error('unexpected error')
      })

      const inTest = new AccountRepositoryPrisma()

      try {
        await inTest.findOne(accountDefault)
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message as string).toEqual('unexpected error')
      }
    })
  })

  describe('When verify if an account exists', () => {
    it('should get one account with success', async () => {
      jest
        .spyOn(clientPrisma.account, 'findUnique')
        .mockResolvedValueOnce(createdAccount)

      const inTest = new AccountRepositoryPrisma()
      const exists = await inTest.exists({ email: accountDefault.email })

      expect(exists).not.toBeNull()
      expect(exists).toBeTruthy()
    })

    it('should throw an unexpected error', async () => {
      jest.spyOn(clientPrisma.account, 'findUnique').mockImplementation(() => {
        throw new Error('unexpected error')
      })

      const inTest = new AccountRepositoryPrisma()

      try {
        await inTest.exists(accountDefault)
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message as string).toEqual('unexpected error')
      }
    })
  })

  describe('When finding a list of account by a given filter', () => {
    it('should save an account with success', async () => {
      jest
        .spyOn(clientPrisma.account, 'findUnique')
        .mockResolvedValueOnce(createdAccount)

      const inTest = new AccountRepositoryPrisma()
      const account = await inTest.findOne({ email: accountDefault.email })

      expect(account).not.toBeNull()
      expect(account).toEqual(createdAccount)
    })

    it('should throw an unexpected error', async () => {
      jest.spyOn(clientPrisma.account, 'findUnique').mockImplementation(() => {
        throw new Error('unexpected error')
      })

      const inTest = new AccountRepositoryPrisma()

      try {
        await inTest.findOne(accountDefault)
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message as string).toEqual('unexpected error')
      }
    })
  })

  describe('When finding accounts by a given filter', () => {
    it('should get a list of accounts with success', async () => {
      jest
        .spyOn(clientPrisma.account, 'findMany')
        .mockResolvedValueOnce([createdAccount])

      const inTest = new AccountRepositoryPrisma()
      const accounts = await inTest.findAll({ email: accountDefault.email })

      expect(accounts).not.toBeNull()
      expect(accounts).toEqual([createdAccount])
    })

    it('should throw an unexpected error', async () => {
      jest.spyOn(clientPrisma.account, 'findMany').mockImplementation(() => {
        throw new Error('unexpected error')
      })

      const inTest = new AccountRepositoryPrisma()

      try {
        await inTest.findAll(accountDefault)
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message as string).toEqual('unexpected error')
      }
    })
  })

  describe('When deleting all accounts', () => {
    it('should delete all accounts with success', async () => {
      jest.spyOn(clientPrisma.account, 'deleteMany').mockReturnThis()

      const inTest = new AccountRepositoryPrisma()

      await inTest.deleteAll()
      expect(clientPrisma.account.deleteMany).toHaveBeenCalled()
    })

    it('should throw an unexpected error', async () => {
      jest.spyOn(clientPrisma.account, 'deleteMany').mockImplementation(() => {
        throw new Error('unexpected error')
      })

      const inTest = new AccountRepositoryPrisma()

      try {
        await inTest.deleteAll()
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message as string).toEqual('unexpected error')
      }
    })
  })
})
