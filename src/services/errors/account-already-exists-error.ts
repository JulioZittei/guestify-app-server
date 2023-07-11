import { DomainError } from './domain-error'
import HttpStatus from 'http-status-codes'

class AccountAlreadyExistsError extends Error implements DomainError {
  code: number

  constructor(parameter: string) {
    super(`Already exists an account with '${parameter}'.`)
    this.name = 'AccountAlreadyExistsError'
    this.code = HttpStatus.CONFLICT
  }
}

export { AccountAlreadyExistsError }
