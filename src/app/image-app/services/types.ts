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
}

export interface Image {
  _id: string;
  user: string | null;
  imageId: string;
  tags: string[];
  uploadDate: Date;
}