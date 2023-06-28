import { Cache } from '@src/shared/cache'
import NodeCache from 'node-cache'

class CacheNode implements Cache {
  constructor(private cacheService = new NodeCache()) {}

  set<T>(key: string, value: T, ttl = 3600): boolean {
    return this.cacheService.set(key, value, ttl)
  }
  get<T>(key: string): T | undefined {
    return this.cacheService.get(key)
  }
  clearAllCache(): void {
    this.cacheService.flushAll()
  }
}

export default new CacheNode()
