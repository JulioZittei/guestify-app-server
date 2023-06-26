class ServerError extends Error {
  constructor() {
    super(`An unexpected error occurred on the server`)
    this.name = 'ServerError'
  }
}

export { ServerError }
