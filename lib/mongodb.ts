// MongoDB connection utility for Next.js
import { MongoClient, Db } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable')
}

// Global variable to cache the MongoDB connection across hot reloads in development
declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined
}

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  // In development, use a global variable to prevent multiple connections
  if (process.env.NODE_ENV === 'development' && global._mongoClient) {
    cachedClient = global._mongoClient
    cachedDb = cachedClient.db('lost_and_found')
    return { client: cachedClient, db: cachedDb }
  }

  const client = await MongoClient.connect(MONGODB_URI)
  const db = client.db('lost_and_found')

  cachedClient = client
  cachedDb = db

  if (process.env.NODE_ENV === 'development') {
    global._mongoClient = client
  }

  return { client, db }
}
