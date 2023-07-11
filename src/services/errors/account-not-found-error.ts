import { DomainError } from './domain-error'
import HttpStatus from 'http-status-codes'

class AccountNotFoundError extends Error implements DomainError {
  code: number

  constructor(parameter: string) {
    super(`There is no account with '${parameter}'.`)
    this.name = 'AccountNotFoundError'
    this.code = HttpStatus.NOT_FOUND
  }
}

export { AccountNotFoundError }
