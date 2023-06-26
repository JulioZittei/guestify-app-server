import { DomainError } from './domain-error'
import HttpStatus from 'http-status-codes'

class UserAlreadyExistsError extends Error implements DomainError {
  code: number

  constructor(parameter: string) {
    super(`User ${parameter} already exists.`)
    this.name = 'UserAlreadyExistsError'
    this.code = HttpStatus.CONFLICT
  }
}

export { UserAlreadyExistsError }
