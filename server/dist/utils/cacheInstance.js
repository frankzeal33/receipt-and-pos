import NodeCache from 'node-cache';
// TTL = 5 minutes for OTPs, checkperiod cleans expired keys automatically
const nodeCache = new NodeCache({ stdTTL: 60, checkperiod: 120 });
export async function getCache(key) {
    return nodeCache.get(key) ?? null;
}
export async function setCache(key, value, ttl) {
    if (ttl !== undefined) {
        nodeCache.set(key, value, ttl);
    }
    else {
        nodeCache.set(key, value);
    }
}
export async function delCache(key) {
    nodeCache.del(key);
}
export async function incrCache(key, ttl) {
    let value = nodeCache.get(key) || 0;
    value += 1;
    if (ttl !== undefined) {
        nodeCache.set(key, value, ttl);
    }
    else {
        nodeCache.set(key, value);
    }
    return value;
}
