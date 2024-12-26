import { NextApiRequest, NextApiResponse } from 'next';
import { UnsplashClient } from '../../image-app/services/client';

const client = new UnsplashClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { query, page } = req.query;
    const ip = req.headers['x-real-ip'] || req.socket.remoteAddress;

    const images = await client.searchImages(
      query as string,
      parseInt(page as string) || 1,
      ip as string
    );

    res.status(200).json(images);
  } catch (error: any) {
    res.status(error.message === 'Rate limit exceeded' ? 429 : 500)
      .json({ message: error.message });
  }
}