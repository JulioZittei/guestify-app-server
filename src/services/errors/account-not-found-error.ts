import { DomainError } from './domain-error'
import HttpStatus from 'http-status-codes'

class AccountNotFoundError extends Error implements DomainError {
  code: number

  constructor(parameter: string) {
    super(`Account ${parameter} not found.`)
    this.name = 'AccountNotFoundError'
    this.code = HttpStatus.NOT_FOUND
  }
}

export { AccountNotFoundError }
