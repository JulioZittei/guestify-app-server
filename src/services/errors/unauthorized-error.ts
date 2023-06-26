import { DomainError } from './domain-error'
import HttpStatus from 'http-status-codes'

class UnauthorizedError extends Error implements DomainError {
  code: number

  constructor() {
    super(`Invalid email and/or password.`)
    this.name = 'UnauthorizedError'
    this.code = HttpStatus.UNAUTHORIZED
  }
}

export { UnauthorizedError }
