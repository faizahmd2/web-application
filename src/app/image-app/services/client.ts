import { createApi } from 'unsplash-js';
import { UnsplashImage } from './types';
// import { UnsplashCache } from './cache';
// import { checkRateLimit } from './rate-limiter';

export class UnsplashClient {
  private api;

  constructor() {
    this.api = createApi({
      accessKey: process.env.UNSPLASH_ACCESS_KEY!,
    });
  }

  async searchImages(query: string, page: number = 1, ip: string): Promise<UnsplashImage[]> {
    const cacheKey = `search:${query}:${page}`;
    
    // Check rate limit
    // if (!await checkRateLimit(ip)) {
    //   throw new Error('Rate limit exceeded');
    // }

    // Check cache
    // const cached = await UnsplashCache.get(cacheKey);
    // if (cached) return cached;

    // Fetch fresh data
    const result = await this.api.search.getPhotos({
      query,
      page,
      perPage: 20,
    });

    if (result.errors) {
      throw new Error('Failed to fetch images');
    }

    const images = result.response?.results as UnsplashImage[];
    // await UnsplashCache.set(cacheKey, images);

    return images;
  }

  async getRandomImages(count: number = 10, ip: string): Promise<UnsplashImage[]> {
    const cacheKey = `random:${count}:${new Date().toISOString().split('T')[0]}`;
    
    // if (!await checkRateLimit(ip)) {
    //   throw new Error('Rate limit exceeded');
    // }

    // const cached = await UnsplashCache.get(cacheKey);
    // if (cached) return cached;

    const result = await this.api.photos.getRandom({
      count,
    });

    if (result.errors) {
      throw new Error('Failed to fetch random images');
    }

    const images = Array.isArray(result.response) 
      ? result.response as UnsplashImage[]
      : [result.response as UnsplashImage];

    // let sett = await UnsplashCache.set(cacheKey, images);
    console.log("Radom image");
    return images;
  }
}