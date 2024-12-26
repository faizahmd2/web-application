import Redis from 'iovalkey';

const redis = new Redis();

export class UnsplashCache {
  private static CACHE_TTL = 3600; // 1 hour

  static async get(key: string): Promise<any | null> {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  static async set(key: string, value: any): Promise<void> {
    await redis.set(key, JSON.stringify(value), 'EX', this.CACHE_TTL);
  }

  static async invalidate(key: string): Promise<void> {
    await redis.del(key);
  }
}