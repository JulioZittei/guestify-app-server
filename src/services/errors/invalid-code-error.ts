import { DomainError } from './domain-error'
import HttpStatus from 'http-status-codes'

class InvalidCodeError extends Error implements DomainError {
  code: number

  constructor(parameter: string) {
    super(`Code '${parameter}' invalid. Please, verify the code sent.`)
    this.name = 'InvalidCodeError'
    this.code = HttpStatus.BAD_REQUEST
  }
}

export { InvalidCodeError }
