interface Cache {
  set<T>(key: string, value: T, ttl: number): boolean
  get<T>(key: string): T | undefined
  clearAllCache(): void
}

export { Cache }
