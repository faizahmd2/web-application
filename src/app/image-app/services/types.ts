export interface UnsplashImage {
    id: string;
    urls: {
      raw: string;
      full: string;
      regular: string;
      small: string;
      thumb: string;
    };
    alt_description: string;
    description: string;
    user: {
      name: string;
      username: string;
    };
    likes: number;
}