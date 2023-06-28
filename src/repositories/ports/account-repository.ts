import { Account } from '@src/models/account'
import { DefaultRepository } from './default-repository'

type AccountRepository = DefaultRepository<Account>

export { AccountRepository }
