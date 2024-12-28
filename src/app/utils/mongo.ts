import { MongoClient } from 'mongodb';

class DatabaseService {
  private client: MongoClient | null = null;
  private db: any = null;

  async connect(): Promise<any> {
    if (this.db) return this.db;

    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in the environment variables');
    }

    this.client = new MongoClient(process.env.MONGO_URI);
    await this.client.connect();
    this.db = this.client.db('image-upload');
    return this.db;
  }

  async getCollection(name: string): Promise<any> {
    const db = await this.connect();
    return db.collection(name);
  }
}

export default DatabaseService;
