import { DomainError } from './domain-error'
import HttpStatus from 'http-status-codes'

class EmailConfirmationPendingError extends Error implements DomainError {
  code: number

  constructor() {
    super(`Email confirmation pending.`)
    this.name = 'EmailConfirmationPendingError'
    this.code = HttpStatus.PRECONDITION_FAILED
  }
}

export { EmailConfirmationPendingError }
