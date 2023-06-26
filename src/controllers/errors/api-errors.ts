interface ApiError {
  path: string
  code: number
  message: string
  description?: string
  documentation?: string
}

export { ApiError }
