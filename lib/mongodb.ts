import { MongoClient, Db } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined;
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<{
  client: MongoClient;
  db: Db;
}> {
  // Return cached connection if available
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // Reuse global connection in development (hot reload safe)
  if (process.env.NODE_ENV === "development" && global._mongoClient) {
    cachedClient = global._mongoClient;
    cachedDb = cachedClient.db("lost_and_found");

    return { client: cachedClient, db: cachedDb };
  }

  // Create new connection for database
  const client = await MongoClient.connect(MONGODB_URI);

  const db = client.db("lost_and_found");

  cachedClient = client;
  cachedDb = db;

  // Store globally in dev to prevent multiple connections
  if (process.env.NODE_ENV === "development") {
    global._mongoClient = client;
  }

  return { client, db };
}
