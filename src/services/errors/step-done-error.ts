import { DomainError } from './domain-error'
import HttpStatus from 'http-status-codes'

class StepDoneError extends Error implements DomainError {
  code: number

  constructor() {
    super(`Step done.`)
    this.name = 'StepDoneError'
    this.code = HttpStatus.GONE
  }
}

export { StepDoneError }
