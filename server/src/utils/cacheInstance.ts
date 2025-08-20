import NodeCache from 'node-cache';

// TTL = 5 minutes for OTPs, checkperiod cleans expired keys automatically
const nodeCache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

export async function getCache<T>(key: string): Promise<T | null> {
  return nodeCache.get<T>(key) ?? null;
}

export async function setCache<T>(key: string, value: T, ttl?: number): Promise<void> {
    if (ttl !== undefined) {
        nodeCache.set(key, value, ttl);
    } else {
        nodeCache.set(key, value);
    }
}

export async function delCache(key: string): Promise<void> {
  nodeCache.del(key);
}

export async function incrCache(key: string, ttl?: number): Promise<number> {
  let value = nodeCache.get<number>(key) || 0;
  value += 1;
  if (ttl !== undefined) {
    nodeCache.set(key, value, ttl);
  } else {
    nodeCache.set(key, value);
  }
  return value;
}

