import { createApi } from 'unsplash-js';
import { Image, UnsplashImage } from './types';
// import { UnsplashCache } from './cache';
// import { checkRateLimit } from './rate-limiter';
import DatabaseService from '@/app/utils/mongo';
import { getUrlFromImageId } from '@/app/utils/image-url-converter';
const dbService = new DatabaseService();

export class UnsplashClient {
  private api;

  constructor() {
    this.api = createApi({
      accessKey: process.env.UNSPLASH_ACCESS_KEY!,
    });
  }

  async searchImages(search: string, page: number = 1, ip: string, userId: string | null, showUpload: string): Promise<UnsplashImage[]> {
    const cacheKey = `search:${search}:${page}`;
    
    // Check rate limit
    // if (!await checkRateLimit(ip)) {
    //   throw new Error('Rate limit exceeded');
    // }

    // Check cache
    // const cached = await UnsplashCache.get(cacheKey);
    // if (cached) return cached;

    let images;
    if(showUpload === 'true') {
      const query: any = {};
      if (userId) {
        query.userId = userId;
      }
      if(search) {
        let $or = [];
        for(let s of search.split(",")) {
          $or.push({tags: s});
        }

        query.$or = $or;
      }
  
      const imagesCollection = await dbService.getCollection('images');
      const total = await imagesCollection.countDocuments(query);
      const imagesColl = await imagesCollection
        .find(query)
        .sort({uploadDate: -1})
        .skip((page - 1) * total)
        .limit(20)
        .toArray();
      images = imagesColl.map((v: Image)=> {
        let url = getUrlFromImageId(v.imageId);
        let formattedObj: UnsplashImage = { id: v._id, urls: { raw: url, small: url, full: url, regular: url, thumb: url }, alt_description: "", description: "" };

        return formattedObj;
      })
    } else {
      // Fetch fresh data
      const result = await this.api.search.getPhotos({
        query: search,
        page,
        perPage: 20,
      });
  
      if (result.errors) {
        throw new Error('Failed to fetch images');
      }
  
      images = result.response?.results as UnsplashImage[];
    }

    // await UnsplashCache.set(cacheKey, images);

    return images;
  }

  async getRandomImages(count: number = 10, ip: string, userId: string | null, showUpload: boolean, page: number): Promise<UnsplashImage[]> {
    const cacheKey = `random:${count}:${new Date().toISOString().split('T')[0]}`;
    
    // if (!await checkRateLimit(ip)) {
    //   throw new Error('Rate limit exceeded');
    // }

    // const cached = await UnsplashCache.get(cacheKey);
    // if (cached) return cached;

    
    let images;
    if(showUpload) {
      const query: any = {};
      if (userId) {
        query.userId = userId;
      }
  
      const imagesCollection = await dbService.getCollection('images');
      const total = await imagesCollection.countDocuments(query);
      const imagesColl = await imagesCollection
        .find(query)
        .sort({uploadDate: -1})
        .skip((page - 1) * total)
        .limit(count)
        .toArray();
      images = imagesColl.map((v: Image)=> {
        let url = getUrlFromImageId(v.imageId);
        let formattedObj: UnsplashImage = { id: v._id, urls: { raw: url, small: url, full: url, regular: url, thumb: url }, alt_description: "", description: "" };

        return formattedObj;
      })
    } else {
      const result = await this.api.photos.getRandom({
        count,
      });
  
      if (result.errors) {
        throw new Error('Failed to fetch random images');
      }
  
      images = Array.isArray(result.response) 
        ? result.response as UnsplashImage[]
        : [result.response as UnsplashImage];
    }

    // let sett = await UnsplashCache.set(cacheKey, images);
    return images;
  }
}