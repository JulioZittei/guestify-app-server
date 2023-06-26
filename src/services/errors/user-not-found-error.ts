import { DomainError } from './domain-error'
import HttpStatus from 'http-status-codes'

class UserNotFoundError extends Error implements DomainError {
  code: number

  constructor(parameter: string) {
    super(`User ${parameter} not found.`)
    this.name = 'UserNotFoundError'
    this.code = HttpStatus.NOT_FOUND
  }
}

export { UserNotFoundError }
