import { DomainError } from './domain-error'
import HttpStatus from 'http-status-codes'

class ExpiredCodeError extends Error implements DomainError {
  code: number

  constructor() {
    super(`Code expired. Please, resend the code.`)
    this.name = 'ExpiredCodeError'
    this.code = HttpStatus.GONE
  }
}

export { ExpiredCodeError }
