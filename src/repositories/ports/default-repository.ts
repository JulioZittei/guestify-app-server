type FilterOptions = Record<string, unknown>

interface DefaultRepository<T> {
  create(data: T): Promise<T>
  exists(filter: FilterOptions): Promise<boolean>
  findOne(filter: FilterOptions): Promise<T | null | undefined>
  findAll(filter: FilterOptions): Promise<T[]>
  deleteAll(): Promise<void>
}

export { DefaultRepository, FilterOptions }
